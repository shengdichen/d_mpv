var util_misc = require("../util");
var report = require("./report");
var util = require("./util").export;

var MODULE = {};

function _delay(target) {
  if (target === "primary") {
    target = "sub-delay";
  } else if (target === "secondary") {
    target = "secondary-sub-delay";
  }
  return util_misc.format.truncate_after_decimal(
    util.property.get_number(target)
  );
}
function _retime_primary(incr) {
  util.exec.run(["add", "sub-delay", incr]);
  util.osd.print("subtitle/delay-primary> " + _delay("primary"));
}
function _retime_secondary(incr) {
  util.exec.run(["add", "secondary-sub-delay", incr]);
  util.osd.print("subtitle/delay-secondary> " + _delay("secondary"));
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
      util.osd.print(
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
    util.exec.run(["add", "sub-scale", incr]);
    util.osd.print(
      "subtitle/scale> " +
        util_misc.format.truncate_after_decimal(
          util.property.get_number("sub-scale")
        )
    );
  };
};

/**
 * @param {number} incr
 * @returns {function(): void}
 */
MODULE.move = function (incr) {
  return function () {
    util.exec.run(["add", "sub-pos", incr]);
    util.osd.print("subtitle/pos> " + util.property.get_number("sub-pos"));
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
      util.exec.run(["cycle", "sub", "up"]);
    } else {
      util.exec.run(["cycle", "sub", "down"]);
    }
    report.tracking.print_pretty_subtitle();
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
      util.property.cycle("sub-visibility");
      var visible_primary = util.property.get_boolean("sub-visibility");
      util.osd.print(
        "subtitle/visibility> " + (!visible_primary ? "primary" : "secondary")
      );
      util.property.set_boolean("secondary-sub-visibility", !visible_primary);
    } else {
      var opt =
        target === "primary" ? "sub-visibility" : "secondary-sub-visibility";
      util.property.cycle(opt);
      util.osd.print(
        "subtitle/visibility-" +
          target +
          "> " +
          (util.property.get_boolean(opt) ? "T" : "F")
      );
    }
  };
};

module.exports = {
  export: MODULE,
};
