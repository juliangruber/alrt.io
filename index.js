var http = require('http');
var ecstatic = require('ecstatic');
var serve = ecstatic(__dirname + '/public');

/**
 * Single page http server.
 */

module.exports = http.createServer(function(req, res) {
  if (!/^\/build\//.test(req.url)) req.url = '/';
  serve(req, res);
});