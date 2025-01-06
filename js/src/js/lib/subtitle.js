var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var MODULE = {};

function _offset_primary() {
  var offset = -mpv.property.get_number("sub-delay");
  return util.format.format_as_increment(offset, { n_digits_after_decimal: 2 });
}
function _offset_secondary() {
  var offset = -mpv.property.get_number("secondary-sub-delay");
  return util.format.format_as_increment(offset, { n_digits_after_decimal: 2 });
}
function _retime_primary(offset) {
  mpv.exec.run(["add", "sub-delay", -offset]);
}
function _retime_secondary(offset) {
  mpv.exec.run(["add", "secondary-sub-delay", -offset]);
}
/**
 * retime subtitle by offset:
 *  negative offset := positive delay == subtitle appears later
 *  positive offset := negative delay == subtitle appears earlier
 * @param {number} offset
 * @param {string} target
 */
MODULE.retime = function (offset, target) {
  if (target === "primary") {
    _retime_primary(offset);
    mpv.osd.print("subtitle/offset-primary> " + _offset_primary());
    return;
  }

  if (target === "secondary") {
    _retime_secondary(offset);
    mpv.osd.print("subtitle/offset-secondary> " + _offset_secondary());
    return;
  }

  _retime_primary(offset);
  _retime_secondary(offset);
  mpv.osd.print(
    "subtitle/offset> (primary, secondary): " +
      _offset_primary() +
      ", " +
      _offset_secondary()
  );
};

/**
 * @returns {number}
 */
MODULE.get_size = function () {
  return mpv.property.get_number("sub-scale");
};

/**
 * @returns {string}
 */
MODULE.get_size_formatted = function () {
  return util.format.format_float(MODULE.get_size(), {
    n_digits_after_decimal: 2,
  });
};

/**
 * @param {number} incr
 */
MODULE.resize = function (incr) {
  var size_avant = MODULE.get_size_formatted();
  mpv.exec.run(["add", "sub-scale", incr]);
  var size_apres = MODULE.get_size_formatted();

  mpv.osd.print(
    "subtitle/scale> " +
      util.format.format_as_evolution(size_avant, incr, size_apres)
  );
};

/**
 * @param {number} incr
 */
MODULE.move_primary = function (incr) {
  var pos_avant = mpv.property.get_number("sub-pos");
  mpv.exec.run(["add", "sub-pos", incr]);
  var pos_apres = mpv.property.get_number("sub-pos");

  mpv.osd.print(
    "subtitle/pos-primary> " +
      util.format.format_as_evolution(pos_avant, incr, pos_apres)
  );
};

/**
 * @param {number} incr
 */
MODULE.move_secondary = function (incr) {
  var pos_avant = mpv.property.get_number("secondary-sub-pos");
  mpv.exec.run(["add", "secondary-sub-pos", incr]);
  var pos_apres = mpv.property.get_number("secondary-sub-pos");

  mpv.osd.print(
    "subtitle/pos-secondary> " +
      util.format.format_as_evolution(pos_avant, incr, pos_apres)
  );
};

/**
 * @param {integer} [offset]
 */
MODULE.navigate_primary = function (offset) {
  mpv.property.shift("sid", offset || +1);
  report.tracking.print_pretty_subtitle();
};

/**
 * @param {integer} [offset]
 */
MODULE.navigate_secondary = function (offset) {
  mpv.property.shift("secondary-sid", offset || +1);
  report.tracking.print_pretty_subtitle();
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
