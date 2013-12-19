
/**
 * Module dependencies.
 */

var Timer = require('timer');
var bind = require('bind');

/**
 * Expose `Sequence`.
 */

module.exports = Sequence;

/**
 * Sequence.
 *
 * @param {String} seq
 * @return {Sequence}
 * @api public
 */

function Sequence(seq) {
  this.seq = seq.split(',');
  this.el = document.createElement('div');
  this.next();
}

/**
 * Start next timer in sequence.
 *
 * @api private
 */

Sequence.prototype.next = function() {
  var dur = this.seq.shift();
  if (typeof dur == 'undefined') return;
  if (this.timer) this.timer.abort();
  this.timer = new Timer(dur);
  this.el.innerHTML = '';
  this.el.appendChild(this.timer.el);
  this.timer.on('end', bind(this, 'next'));
};

/**
 * End the sequence.
 *
 * @api public
 */

Sequence.prototype.end = function() {
  this.timer.abort();
};
