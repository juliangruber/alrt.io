
/**
 * Module dependencies.
 */

var bind = require('bind');
var css = require('css');
var debounce = require('debounce');
var span = require('span');
var page = require('page');
var autoscale = require('autoscale-canvas');
var template = require('./template');
var domify = require('domify');

/**
 * Device pixel ratio
 */

var ratio = window.devicePixelRatio || 1;

/**
 * Tau.
 */

var tau = Math.PI * 2;

/**
 * Expose `Time`.
 */

module.exports = Time;

/**
 * Time view.
 *
 * @return {Time}
 * @api public
 */

function Time(time) {
  var self = this;
  this.time = time;
  this.stopped = false;
  this.ended = false;
  this.el = domify(template);
  this.el.style.display = 'none';
  this.canvas = this.el.querySelector('canvas');
  this.ctx = this.canvas.getContext('2d');
  this.copy = this.el.querySelector('.copy');
  this.copy.onclick = function() {
    page('/');
  };
  this.pulsate();
  this.update(this.time);
  setTimeout(bind(this, 'place'));
  this._place = bind(this, debounce(this.place, 200));
  window.addEventListener('resize', this._place);
}

/**
 * Pulsate the text.
 *
 * @api private
 */

Time.prototype.pulsate = function() {
  var self = this;
  var i = 0;
  
  function pulsate() {
    if (self.stopped || self.ended) return;
    setTimeout(pulsate, 500);
    if (++i % 2) {
      self.copy.classList.add('high');
    } else {
      self.copy.classList.remove('high');
    }
  }
  
  pulsate();
};

/**
 * Update time left.
 *
 * @param {Number} time
 * @api public
 */

Time.prototype.update = function(time) {
  this.draw(time / this.time);
};

/**
 * Mark the timer as ended.
 *
 * @api public
 */

Time.prototype.end = function() {
  var self = this;
  var i = 0;
  self.ended = true;
  self.draw(1);
  
  setTimeout(function() {
    function pulsate() {
      if (self.stopped) return;
      setTimeout(pulsate, 1000);
      self.canvas.style.opacity = ++i % 2 ? 0 : 1;
    }
    
    self.canvas.style.transition = '.8s';
    setTimeout(pulsate, 500);
  });
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
  var size = min * .8;
  this.canvas.width = size;
  this.canvas.height = size;
  autoscale(this.canvas);
  css(this.el, {
    display: 'block'
  });
  css(this.canvas, {
    position: 'absolute',
    top: par.offsetHeight / 2 - size / 2,
    left: par.offsetWidth / 2 - size / 2
  });
};

/**
 * Draw the circular time indicator.
 *
 * @param {Number} factor
 * @api private
 */

Time.prototype.draw = function(fac) {
  var ctx = this.ctx;
  var size = this.canvas.width / ratio;
  var half = size / 2;
  var x = half;
  var y = half;
  var rad = half - 1;
  var angle = tau * fac;
  
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = '#EEF3B9';
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, angle, false);
  ctx.stroke();
};
