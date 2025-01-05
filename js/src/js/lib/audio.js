var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var MODULE = {};

/**
 * @param {number} incr
 * @returns {function(): void}
 */
MODULE.volume = function (incr) {
  return function () {
    var vol_prev = mpv.property.get_number("volume");
    var vol_next = vol_prev + incr;
    mpv.property.set_number("volume", vol_next);

    mpv.osd.print(
      "audio/volume> " +
        util.format.format_as_evolution(vol_prev, incr, vol_next)
    );
  };
};

MODULE.mute = function () {
  mpv.property.cycle("mute");
  mpv.osd.print(
    "audio/mute> " +
      util.format.format_boolean(mpv.property.get_boolean("mute"))
  );
};

/**
 * @param {integer} [incr]
 */
MODULE.navigate = function (incr) {
  mpv.property.shift("audio", incr || +1);
  report.tracking.print_pretty_audio();
};

module.exports = {
  export: MODULE,
};
