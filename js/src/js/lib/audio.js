var util_misc = require("../util");
var report = require("./report");
var util = require("./util").export;

var MODULE = {};

/**
 * @param {number} incr
 * @returns {function(): void}
 */
MODULE.volume = function (incr) {
  return function () {
    var vol_prev = util.property.get_number("volume");
    var vol_next = vol_prev + incr;
    util.property.set_number("volume", vol_next);
    util.osd.print(
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
  return util_misc.format.prepend_sign(incr);
}

MODULE.mute = function () {
  util.property.cycle("mute");
  util.osd.print("mute> " + (util.property.get_boolean("mute") ? "T" : "F"));
};

MODULE.navigate = function () {
  util.property.cycle("audio");
  report.tracking.print_pretty_audio();
};

module.exports = {
  export: MODULE,
};
