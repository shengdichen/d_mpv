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

MODULE.config = function () {
  util.bind("9", MODULE.volume(-1));
  util.bind("(", MODULE.volume(-7));
  util.bind("0", MODULE.volume(+1));
  util.bind(")", MODULE.volume(+7));

  util.bind("m", MODULE.mute);

  util.bind("SHARP", MODULE.navigate);
};

module.exports = {
  export: MODULE,
};
