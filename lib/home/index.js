
/**
 * Module dependencies.
 */

var template = require('./template');
var domify = require('domify');
var page = require('page');

/**
 * Home view.
 *
 * @return {Element}
 * @api public
 */

module.exports = function() {
  var el = domify(template);
  var form = el.querySelector('form');
  var input = form.querySelector('input');
  
  form.addEventListener('submit', function(e) {
    page('/' + input.value);
    e.preventDefault();
  });
  
  return el;
};
