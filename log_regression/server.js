var path = require('path');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var JIFFServer = require('../JIFF/lib/jiff-server');
var base_instance = new JIFFServer(http, { logs:true });

var jiffBigNumberServer = require('../JIFF/lib/ext/jiff-server-bignumber');
base_instance.apply_extension(jiffBigNumberServer);


// Serve static files.
app.use('/demos', express.static(path.join(__dirname, '..', 'JIFF', 'demos')));
app.use('/dist', express.static(path.join(__dirname, '..', 'JIFF', 'dist')));
app.use('/lib/ext', express.static(path.join(__dirname, '..', 'JIFF', 'lib', 'ext')));
app.use('/bignumber.js', express.static(path.join(__dirname, '..', 'node_modules', 'bignumber.js')));
http.listen(8080, function () {
  console.log('listening on *:8080');
});

console.log('To run a server-based party: node demos/<demo-name>/party <input');
console.log();
