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
      "volume> " + vol_next + " [" + vol_prev + _format_volume_incr(incr) + "]"
    );
  };
};

function _format_volume_incr(incr) {
  if (incr === 1) {
    return "++";
  }
  if (incr === -1) {
    return "--";
  }
  return util.format.prepend_sign(incr);
}

MODULE.mute = function () {
  mpv.property.cycle("mute");
  mpv.osd.print("mute> " + (mpv.property.get_boolean("mute") ? "T" : "F"));
};

MODULE.navigate = function () {
  mpv.property.cycle("audio");
  report.tracking.print_pretty_audio();
};

module.exports = {
  export: MODULE,
};
