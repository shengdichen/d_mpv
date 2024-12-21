var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var MODULE = {};

function _delay(target) {
  if (target === "primary") {
    target = "sub-delay";
  } else if (target === "secondary") {
    target = "secondary-sub-delay";
  }
  return util.format.format_float(mpv.property.get_number(target), {
    prepend_sign: true,
    n_digits_after_decimal: 2,
  });
}
function _retime_primary(incr) {
  mpv.exec.run(["add", "sub-delay", incr]);
  mpv.osd.print("subtitle/delay-primary> " + _delay("primary"));
}
function _retime_secondary(incr) {
  mpv.exec.run(["add", "secondary-sub-delay", incr]);
  mpv.osd.print("subtitle/delay-secondary> " + _delay("secondary"));
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
      mpv.osd.print(
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
    mpv.exec.run(["add", "sub-scale", incr]);
    mpv.osd.print(
      "subtitle/scale> " +
        util.format.format_float(mpv.property.get_number("sub-scale"), {
          n_digits_after_decimal: 2,
        })
    );
  };
};

/**
 * @param {number} incr
 * @returns {function(): void}
 */
MODULE.move = function (incr) {
  return function () {
    mpv.exec.run(["add", "sub-pos", incr]);
    mpv.osd.print("subtitle/pos> " + mpv.property.get_number("sub-pos"));
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
      mpv.exec.run(["cycle", "sub", "up"]);
    } else {
      mpv.exec.run(["cycle", "sub", "down"]);
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
      mpv.property.cycle("sub-visibility");
      var visible_primary = mpv.property.get_boolean("sub-visibility");
      mpv.osd.print(
        "subtitle/visibility> " + (!visible_primary ? "primary" : "secondary")
      );
      mpv.property.set_boolean("secondary-sub-visibility", !visible_primary);
    } else {
      var opt =
        target === "primary" ? "sub-visibility" : "secondary-sub-visibility";
      mpv.property.cycle(opt);
      mpv.osd.print(
        "subtitle/visibility-" +
          target +
          "> " +
          util.format.format_boolean(mpv.property.get_boolean(opt))
      );
    }
  };
};

module.exports = {
  export: MODULE,
};
