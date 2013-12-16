var Progress = require('progress');
var bind = require('bind');
var css = require('css');
var debounce = require('debounce');
var span = require('span');

module.exports = Time;

/**
 * Time view.
 *
 * @return {Time}
 * @api public
 */

function Time(time) {
  this.time = time;
  this.stopped = false;
  this.progress = new Progress();
  this.el = this.progress.el;
  css(this.el, { display: 'none' });
  setTimeout(bind(this, 'place'));
  this._place = bind(this, debounce(this.place, 200));
  window.addEventListener('resize', this._place);
  this.update(this.time);
}

/**
 * Update time left.
 *
 * @param {Number} time
 * @api public
 */

Time.prototype.update = function(time) {
  this.progress.text(span(time + 1000));
  this.progress.update(time / this.time * 100);
};

/**
 * Mark the timer as ended.
 *
 * @api public
 */

Time.prototype.end = function() {
  var self = this;
  var i = 0;
  self.progress.text('beep!');
  (function blink() {
    if (self.stopped) return;
    setTimeout(blink, 700);
    self.progress.update(i++ % 2 ? 0 : 100);
  })();
};

/**
 * Remove all listeners.
 *
 * @api public
 */

Time.prototype.destroy = function() {
  window.removeEventListener('resize', this._place);
  this.stopped = true;
};

/**
 * Place and resize inside parent element.
 *
 * @api private
 */

Time.prototype.place = function() {
  var par = this.el.parentNode;
  var min = Math.min(par.offsetHeight, par.offsetWidth);
  var size = min * .7;
  this.progress.size(size);
  css(this.el, {
    display: 'block',
    position: 'absolute',
    top: par.offsetHeight / 2 - size / 2,
    left: par.offsetWidth / 2 - size / 2
  });
};
