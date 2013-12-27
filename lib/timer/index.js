
/**
 * Module dependencies.
 */

var bind = require('bind');
var template = require('./template');
var domify = require('domify');
var text = require('text');
var beep = require('./beep');
var Notifications = window.webkitNotifications
  || window.mozNotifications
  || window.Notifications;
var TimeView = require('time-view');
var span = require('span');
var raf = require('raf');
var Emitter = require('emitter');
var visible = require('visible');

/**
 * Silent switch for development.
 */

var silent = false;

/**
 * Expose `Timer`.
 */

module.exports = Timer;

/**
 * Timer view.
 *
 * @param {String} str
 * @return {Timer}
 * @todo Refactor out 'enable notifications' button
 */
 
function Timer(str) {
  var self = this;
  this.str = str;
  this.span = span(str);
  this.el = domify(template);
  this.enableNotifications(); 
  this.time = new TimeView(this.span);
  this.el.appendChild(this.time.el);
  this.stopped = false;
  this.start = Date.now();
  
  setTimeout(function() {
    self.start = Date.now();
    (function animate() {
      if (self.stopped) return;
      var left = self.start + self.span - Date.now();
      if (left > 0) {
        self.update(left);
        raf(animate);
      } else {
        self.end();
      }
    })();
  });
};

/**
 * Mixin Emitter.
 */

Emitter(Timer.prototype);

/**
 * Abort.
 *
 * @api public
 */

Timer.prototype.abort = function() {
  this.stopped = true;
  this.time.destroy();
};

/**
 * Update display.
 *
 * @param {Number} left
 * @api private
 */

Timer.prototype.update = function(left) {
  this.time.update(left);
};

/**
 * When the timer is done.
 *
 * @api private
 */

Timer.prototype.end = function() {
  if (!silent) beep();
  if (!visible()) notify('Alert', 'Timer finished: ' + this.str);
  this.time.end();
  this.emit('end');
};

/**
 * Show or hide 'enable notifications' button.
 *
 * @api private
 */

Timer.prototype.enableNotifications = function() {
  if (!Notifications) return;
  var enable = this.el.querySelector('button');

  if (!Notifications.checkPermission()) {
    enable.parentNode.removeChild(enable);
  } else {
    enable.addEventListener('click', function() {
      enableNotifications(function(err) {
        if (!err) enable.parentNode.removeChild(enable);
      });
    });
  }
};

/**
 * Notification api helper.
 *
 * @param {String} title
 * @param {String} text
 * @api private
 */

function notify(title, text) {
  if (!Notifications) return;
  var hasCheck = !! Notifications.checkPermission;
  if (hasCheck && Notifications.checkPermission()) return;
  
  Notifications.createNotification('/favicon.ico', title, text).show();
}

/**
 * Enable browser notifications.
 *
 * @api private
 */

function enableNotifications(fn) {
  Notifications.requestPermission(function(perm) {
    if (perm == 'granted') fn();
    else fn(new Error('denied'));
  });
}
