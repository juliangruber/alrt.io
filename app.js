
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var app = module.exports = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.static(__dirname + '/public'))

if (process.env.NODE_ENV != 'production') {
  app.use(express.errorHandler());
}

app.get('/', routes.help);
app.get('/:time', routes.index);
