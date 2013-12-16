var page = require('page');
var Home = require('home');
var Sequence = require('sequence');

// State

var sequence;

/**
 * Reset.
 */

page(function(ctx, next) {
  if (sequence) sequence.end();
  document.body.innerHTML = '';
  next();
});

/**
 * Timer page.
 */

page('/:sequence', function(ctx) {
  sequence = new Sequence(ctx.params.sequence);
  document.body.appendChild(sequence.el);
  analytics.page('Timer', {
    sequence: ctx.params.sequence.split(',')
  });
});

/**
 * Home page.
 */

page(function() {
  document.body.appendChild(Home());
  analytics.page('Home');
});

// GO!

page();
