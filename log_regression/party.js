/**
 * Do not change this unless you have to.
 * This code parses input command line arguments,
 * and calls the appropriate initialization and MPC protocol from ./mpc.js
 */

console.log('Command line arguments: <input> [<party_count> [<computation_id> [<party_id>]]]');
console.log('<<>> input must look like: [x1,y1,x2,y3,...]');
console.log('<<>> all points coordinates must be between -5 and 5 (exclusive), with at most 2 digits of accuracy.');

var mpc = require('./mpc');

// Read Command line arguments
var filename = process.argv[2];

var party_count = process.argv[3];
if (party_count == null) {
  party_count = 2;
} else {
  party_count = parseInt(party_count);
}

var computation_id = process.argv[4];
if (computation_id == null) {
  computation_id = 'test';
}

var party_id = process.argv[5];
if (party_id != null) {
  party_id = parseInt(party_id, 10);
}

// JIFF options
var options = {
  party_count: party_count,
  party_id: party_id,
  /*
  Zp: '2199023255531',
  integer_digits: 6,
  decimal_digits: 3
};
  Zp: '2147483647',
  integer_digits: 5,
  decimal_digits: 2
};
  Zp: '33554393',
  integer_digits: 3,
  decimal_digits: 2
}; */
  Zp: '268435399',
  integer_digits: 4,
  decimal_digits: 2
};

options.onConnect = function (jiff_instance) {
  var promise = mpc.compute(filename);

  promise.then(function (results) {
    console.info('W:', [results.w0.toString(), results.w1.toString()]);
    jiff_instance.disconnect(true);
  });
};

// Connect
mpc.connect('http://localhost:8080', computation_id, options);
