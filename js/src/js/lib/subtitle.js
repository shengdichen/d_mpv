var util = require("../util");
var util_misc = util.util_misc;
var report = util.report;
var util_mpv = require("./util").util;

var MODULE = {};

function _delay(target) {
  if (target === "primary") {
    target = "sub-delay";
  } else if (target === "secondary") {
    target = "secondary-sub-delay";
  }
  return util_misc.truncate_after_decimal(util_mpv.get_prop(target, "num"));
}
function _retime_primary(incr) {
  util_mpv.run(["add", "sub-delay", incr]);
  util_mpv.print_osd("subtitle/delay-primary> " + _delay("primary"));
}
function _retime_secondary(incr) {
  util_mpv.run(["add", "secondary-sub-delay", incr]);
  util_mpv.print_osd("subtitle/delay-secondary> " + _delay("secondary"));
}
MODULE.retime = function (incr, target) {
  return function () {
    if (target === "primary") {
      _retime_primary(incr);
    } else if (target === "secondary") {
      _retime_secondary(incr);
    } else if (target === "both") {
      _retime_primary(incr);
      _retime_secondary(incr);
      util_mpv.print_osd(
        "subtitle/delay> (primary, secondary): " +
          _delay("primary") +
          ", " +
          _delay("secondary")
      );
    }
  };
};

MODULE.resize = function (incr) {
  return function () {
    util_mpv.run(["add", "sub-scale", incr]);
    util_mpv.print_osd(
      "subtitle/scale> " +
        util_misc.truncate_after_decimal(util_mpv.get_prop("sub-scale", "num"))
    );
  };
};

MODULE.reposition = function (incr) {
  return function () {
    util_mpv.run(["add", "sub-pos", incr]);
    util_mpv.print_osd("subtitle/pos> " + util_mpv.get_prop("sub-pos", "num"));
  };
};

MODULE.navigate = function (positive_dir) {
  return function () {
    if (positive_dir) {
      util_mpv.run(["cycle", "sub", "up"]);
    } else {
      util_mpv.run(["cycle", "sub", "down"]);
    }
    report.report_category_sub();
  };
};

MODULE.toggle = function (target) {
  return function () {
    if (target === "both") {
      util_mpv.cycle("sub-visibility");
      var visible_primary = util_mpv.get_prop("sub-visibility");
      util_mpv.set_prop("secondary-sub-visibility", !visible_primary);
      util_mpv.print_osd(
        "subtitle/visibility>" + visible_primary ? "primary" : "secondary"
      );
    } else {
      var opt =
        target === "primary" ? "sub-visibility" : "secondary-sub-visibility";
      util_mpv.cycle(opt);
      util_mpv.print_osd(
        "subtitle/visibility-" +
          target +
          "> " +
          (util_mpv.get_prop(opt) ? "T" : "F")
      );
    }
  };
};

module.exports = {
  subtitle: MODULE,
};
