var util_misc = require("../util").export;
var report = require("./report").export;
var util = require("./util").export;

var MODULE = {};

/**
 * @param {number} incr
 * @returns {function(): void}
 */
MODULE.volume = function (incr) {
  return function () {
    var vol_prev = util.get_prop_number("volume");
    var vol_next = vol_prev + incr;
    util.set_prop_number("volume", vol_next);
    util.print_osd(
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
  return util_misc.prepend_sign(incr);
}

MODULE.mute = function () {
  util.cycle("mute");
  util.print_osd("mute> " + (util.get_prop_boolean("mute") ? "T" : "F"));
};

MODULE.navigate = function () {
  util.cycle("audio");
  report.report_category_audio();
};

module.exports = {
  export: MODULE,
};
