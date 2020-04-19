(function (exports, node) {
  var saved_instance;
  var base_op_id = {
    1: 0,
    2: 0
  };

  /**
   * Connect to the server and initialize the jiff instance
   */
  exports.connect = function (hostname, computation_id, options) {
    var opt = Object.assign({}, options);
    opt.autoConnect = false;
    // Added options goes here
    opt.crypto_provider = true;

    if (node) {
      // eslint-disable-next-line no-undef
      JIFFClient = require('../../lib/jiff-client');
      // eslint-disable-next-line no-undef
      jiff_bignumber = require('../../lib/ext/jiff-client-bignumber');
      // eslint-disable-next-line no-undef
      jiff_fixedpoint = require('../../lib/ext/jiff-client-fixedpoint');
      // eslint-disable-next-line no-undef
      jiff_negativenumber = require('../../lib/ext/jiff-client-negativenumber');
      // eslint-disable-next-line no-undef
      jiff_performance = require('../../lib/ext/jiff-client-performance');
      // eslint-disable-next-line no-undef
      BigNumber = require('bignumber.js');
      // eslint-disable-next-line no-undef,no-global-assign
      $ = require('jquery-deferred');
    }

    opt.autoConnect = false;
    // eslint-disable-next-line no-undef
    saved_instance = new JIFFClient(hostname, computation_id, opt);
    // eslint-disable-next-line no-undef
    saved_instance.apply_extension(jiff_bignumber, opt);
    // eslint-disable-next-line no-undef
    saved_instance.apply_extension(jiff_fixedpoint, opt);
    // eslint-disable-next-line no-undef
    saved_instance.apply_extension(jiff_negativenumber, opt);
    // eslint-disable-next-line no-undef
    saved_instance.apply_extension(jiff_performance, { elementId: 'perfDiv' });

    saved_instance.connect();
    return saved_instance;
  };

  function init_y_majority (bags, proportions) {
    var y = []
    for (var i = 0; i < bags.length; i++) {
      var bag = bags[i];
      if (proportions[bag] >= 0.5) {
        y[i] = 1
      } else {
        y[i] = -1
      }
    }
    return y;
  }

  function toFixed(num) {
    var str = num.toFixed(13, BigNumber.ROUND_FLOOR);
    num = new BigNumber(str);
    if (num.gte(new BigNumber(10).pow(2))) {
      console.log('Warning: test: increase integer digits!, ', num.toString());
    }
    return num;
  }

  /**
   * The MPC computation
   */
  exports.compute = function (training_data, jiff_instance) {
    if (jiff_instance == null) {
      jiff_instance = saved_instance;
    }

    // Unique prefix seed for all op ids
    var op_id_seed = base_op_id[jiff_instance.id]++;

    var filename = require('/Users/ashnishah/workspaces/MPC-ML-Election-Polling/demos/log_regression/' + training_data);
    var bags = filename['bags_train'];
    var proportions = filename['proportions'];
    var y_values = init_y_majority(bags, proportions);
    var X_train = [];
    for (var i = 0; i < filename['X_train'].length; i++) {
      X_train.push(toFixed(filename['X_train'][i][0]));
      X_train.push(toFixed(filename['X_train'][i][1]));
    }

    var deferred = $.Deferred();
    var zero = jiff_instance.share(0, null, null, [1])[1];
    var one = jiff_instance.share(1, null, null, [1])[1];
    var precision = jiff_instance.helpers.magnitude(jiff_instance.decimal_digits);

    zero = zero.cmult(precision); // increase precision

    // share input with all parties
    var x_shares = jiff_instance.share_array(X_train);
    var y_shares = jiff_instance.share_array(y_values);
    Promise.all([x_shares, y_shares]).then(function ([x_shares, y_shares]) {
      jiff_instance.seed_ids(op_id_seed);
      var i, j, p;
      var xwAvg = zero;
      // initialize W = [1,1]
      var W = [zero, zero];

      for (j = 0; j < W.length; j++) {
        var length = 0;
        for (p = 1; p <= jiff_instance.party_count; p++) {
          for (i = 0; i < x_shares[p].length; i += 2) {
            // xW - y
            var xw = W[0].sadd(W[1]);
            var x_sum = x_shares[p][i].sadd(x_shares[p][i + 1]);
            xw = xw.smult(x_sum);
            xw = xw.ssub(y_shares[p][i/2]);
            // (xW - y) * x_ij
            xw = xw.smult(x_shares[p][i+j]);
            xwAvg = xwAvg.sadd(xw);
            length++;
          }
        }
        xwAvg = xwAvg.cdiv(length);
        W[j] = W[j].ssub(xwAvg);
      }

      var promises = [];
      for (j = 0; j < W.length; j++) {
        promises.push(jiff_instance.open(W[j]));
      }
      Promise.all(promises).then(function (results) {
        deferred.resolve(results);
      });
    });


    return deferred.promise();
  };
}((typeof exports === 'undefined' ? this.mpc = {} : exports), typeof exports !== 'undefined'));
