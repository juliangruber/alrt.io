var ctx = require('audio-context');

/**
 * Beep!
 *
 * @api private
 */

module.exports = function beep() {
  if (!ctx || !ctx.createOscillator) return;
  var osc = ctx.createOscillator();
  osc.connect(ctx.destination);
  osc.frequency.value = 440;
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1);
};
