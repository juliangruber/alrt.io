var page = require('page');
var Home = require('home');
var Timer = require('timer');

// State

var timer;

/**
 * Reset.
 */

page(function(ctx, next) {
  if (timer) timer.abort();
  document.body.innerHTML = '';
  next();
});

/**
 * Timer page.
 */

page('/:duration', function(ctx) {
  timer = new Timer(ctx.params.duration);
  document.body.appendChild(timer.el);
  analytics.page('Timer', {
    duration: ctx.params.duration
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
