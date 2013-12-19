var ctx = require('audio-context');

/**
 * Beep!
 *
 * @api private
 * @todo fade in/out
 */

module.exports = function beep() {
  if (!ctx || !ctx.createOscillator) return;
  var osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.frequency.value = 460;
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
};
