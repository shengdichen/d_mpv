var util_misc = require("../util").export;
var report = require("./report").export;
var util = require("./util").export;

var MODULE = {};

function _delay(target) {
  if (target === "primary") {
    target = "sub-delay";
  } else if (target === "secondary") {
    target = "secondary-sub-delay";
  }
  return util_misc.truncate_after_decimal(util.get_prop(target, "num"));
}
function _retime_primary(incr) {
  util.run(["add", "sub-delay", incr]);
  util.print_osd("subtitle/delay-primary> " + _delay("primary"));
}
function _retime_secondary(incr) {
  util.run(["add", "secondary-sub-delay", incr]);
  util.print_osd("subtitle/delay-secondary> " + _delay("secondary"));
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
      util.print_osd(
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
    util.run(["add", "sub-scale", incr]);
    util.print_osd(
      "subtitle/scale> " +
        util_misc.truncate_after_decimal(util.get_prop("sub-scale", "num"))
    );
  };
};

MODULE.reposition = function (incr) {
  return function () {
    util.run(["add", "sub-pos", incr]);
    util.print_osd("subtitle/pos> " + util.get_prop("sub-pos", "num"));
  };
};

MODULE.navigate = function (positive_dir) {
  return function () {
    if (positive_dir) {
      util.run(["cycle", "sub", "up"]);
    } else {
      util.run(["cycle", "sub", "down"]);
    }
    report.report_category_sub();
  };
};

MODULE.toggle = function (target) {
  return function () {
    if (target === "both") {
      util.cycle("sub-visibility");
      var visible_primary = util.get_prop("sub-visibility");
      util.set_prop("secondary-sub-visibility", !visible_primary);
      util.print_osd(
        "subtitle/visibility>" + visible_primary ? "primary" : "secondary"
      );
    } else {
      var opt =
        target === "primary" ? "sub-visibility" : "secondary-sub-visibility";
      util.cycle(opt);
      util.print_osd(
        "subtitle/visibility-" +
          target +
          "> " +
          (util.get_prop(opt) ? "T" : "F")
      );
    }
  };
};

module.exports = {
  export: MODULE,
};
