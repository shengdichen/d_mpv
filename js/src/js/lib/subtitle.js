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
  return util_misc.truncate_after_decimal(util.get_prop_number(target));
}
function _retime_primary(incr) {
  util.run(["add", "sub-delay", incr]);
  util.print_osd("subtitle/delay-primary> " + _delay("primary"));
}
function _retime_secondary(incr) {
  util.run(["add", "secondary-sub-delay", incr]);
  util.print_osd("subtitle/delay-secondary> " + _delay("secondary"));
}
/**
 * @param {number} incr
 * @param {string} target
 * @returns {function(): void}
 */
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

/**
 * @param {number} incr
 * @returns {function(): void}
 */
MODULE.resize = function (incr) {
  return function () {
    util.run(["add", "sub-scale", incr]);
    util.print_osd(
      "subtitle/scale> " +
        util_misc.truncate_after_decimal(util.get_prop_number("sub-scale"))
    );
  };
};

/**
 * @param {number} incr
 * @returns {function(): void}
 */
MODULE.move = function (incr) {
  return function () {
    util.run(["add", "sub-pos", incr]);
    util.print_osd("subtitle/pos> " + util.get_prop_number("sub-pos"));
  };
};

/**
 * @param {number} [incr]
 * @returns {function(): void}
 */
MODULE.move_down = function (incr) {
  return MODULE.move(incr || 1);
};

/**
 * @param {number} [incr]
 * @returns {function(): void}
 */
MODULE.move_up = function (incr) {
  return MODULE.move(-(incr || 1));
};

/**
 * @param {boolean} positive_dir
 * @returns {function(): void}
 */
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

/**
 * @returns {function(): void}
 */
MODULE.navigate_prev = function () {
  return MODULE.navigate(false);
};

/**
 * @returns {function(): void}
 */
MODULE.navigate_next = function () {
  return MODULE.navigate(true);
};

/**
 * @param {string} target
 * @returns {function(): void}
 */
MODULE.toggle = function (target) {
  return function () {
    if (target === "both") {
      util.cycle("sub-visibility");
      var visible_primary = util.get_prop_boolean("sub-visibility");
      util.print_osd(
        "subtitle/visibility> " + (!visible_primary ? "primary" : "secondary")
      );
      util.set_prop_boolean("secondary-sub-visibility", !visible_primary);
    } else {
      var opt =
        target === "primary" ? "sub-visibility" : "secondary-sub-visibility";
      util.cycle(opt);
      util.print_osd(
        "subtitle/visibility-" +
          target +
          "> " +
          (util.get_prop_boolean(opt) ? "T" : "F")
      );
    }
  };
};

MODULE.config = function () {
  util.bind("z", MODULE.retime(+0.1, "primary"));
  util.bind("x", MODULE.retime(-0.1, "primary"));
  util.bind("Shift+z", MODULE.retime(+0.1, "secondary"));
  util.bind("Shift+x", MODULE.retime(-0.1, "secondary"));

  util.bind("Shift+g", MODULE.resize(-0.1));
  util.bind("g", MODULE.resize(+0.1));

  util.bind("Shift+t", MODULE.move_up());
  util.bind("t", MODULE.move_down());

  util.bind("Shift+b", MODULE.navigate_prev());
  util.bind("b", MODULE.navigate_next());

  util.bind("v", MODULE.toggle("primary"));
  util.bind("Shift+v", MODULE.toggle("secondary"));
  util.bind("Alt+v", MODULE.toggle("both"));
};

module.exports = {
  export: MODULE,
};
