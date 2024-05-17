var util = require("../util");
var util_misc = util.util_misc;
var report = util.report;
var util_mpv = require("./util").util;

var MODULE = {};

MODULE.volume = function (incr) {
  return function () {
    var vol_prev = util_mpv.get_prop("volume", "num");
    var vol_next = vol_prev + incr;
    util_mpv.set_prop("volume", vol_next, "num");
    util_mpv.print_osd(
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
  util_mpv.cycle("mute");
  util_mpv.print_osd(
    "mute> " + (util_mpv.get_prop("mute", "bool") ? "T" : "F")
  );
};

MODULE.navigate = function () {
  util_mpv.cycle("audio");
  report.report_category_audio();
};

module.exports = {
  audio: MODULE,
};
