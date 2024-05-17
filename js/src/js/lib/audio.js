var util_misc = require("../util").export;
var report = require("./report").export;
var util = require("./util").export;

var MODULE = {};

MODULE.volume = function (incr) {
  return function () {
    var vol_prev = util.get_prop("volume", "num");
    var vol_next = vol_prev + incr;
    util.set_prop("volume", vol_next, "num");
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
  util.print_osd("mute> " + (util.get_prop("mute", "bool") ? "T" : "F"));
};

MODULE.navigate = function () {
  util.cycle("audio");
  report.report_category_audio();
};

module.exports = {
  export: MODULE,
};
