var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var timing = {
  get_offset_primary: function () {
    var offset = -mpv.property.get_number("sub-delay");
    return util.format.format_as_increment(offset, {
      n_digits_after_decimal: 2,
    });
  },
  get_offset_secondary: function () {
    var offset = -mpv.property.get_number("secondary-sub-delay");
    return util.format.format_as_increment(offset, {
      n_digits_after_decimal: 2,
    });
  },

  _retime_primary: function (offset) {
    mpv.exec.run(["add", "sub-delay", -offset]);
  },
  _retime_secondary: function (offset) {
    mpv.exec.run(["add", "secondary-sub-delay", -offset]);
  },
  _retime_both: function (offset) {
    timing._retime_primary(offset);
    timing._retime_secondary(offset);
  },

  /**
   * retime subtitle by offset:
   *    negative offset := positive delay == subtitle appears later
   *    positive offset := negative delay == subtitle appears earlier
   * @param {number} offset
   * @param {string} target
   */
  retime: function (offset, target) {
    if (target === "primary") {
      timing._retime_primary(offset);
      mpv.osd.print("subtitle/offset-primary> " + timing.get_offset_primary());
      return;
    }

    if (target === "secondary") {
      timing._retime_secondary(offset);
      mpv.osd.print(
        "subtitle/offset-secondary> " + timing.get_offset_secondary()
      );
      return;
    }

    timing._retime_both(offset);
    mpv.osd.print(
      "subtitle/offset> (primary, secondary): " +
        timing.get_offset_primary() +
        ", " +
        timing.get_offset_secondary()
    );
  },
};

var sizing = {
  /**
   * @returns {number}
   */
  get_size: function () {
    return mpv.property.get_number("sub-scale");
  },

  /**
   * @returns {string}
   */
  get_size_formatted: function () {
    return util.format.format_float(sizing.get_size(), {
      n_digits_after_decimal: 2,
    });
  },

  /**
   * @param {number} incr
   */
  resize: function (incr) {
    var size_avant = sizing.get_size_formatted();
    mpv.exec.run(["add", "sub-scale", incr]);
    var size_apres = sizing.get_size_formatted();

    mpv.osd.print(
      "subtitle/scale> " +
        util.format.format_as_evolution(size_avant, incr, size_apres)
    );
  },
};

var position = {
  /**
   * @param {number} incr
   */
  move_primary: function (incr) {
    var pos_avant = mpv.property.get_number("sub-pos");
    mpv.exec.run(["add", "sub-pos", incr]);
    var pos_apres = mpv.property.get_number("sub-pos");

    mpv.osd.print(
      "subtitle/pos-primary> " +
        util.format.format_as_evolution(pos_avant, incr, pos_apres)
    );
  },

  /**
   * @param {number} incr
   */
  move_secondary: function (incr) {
    var pos_avant = mpv.property.get_number("secondary-sub-pos");
    mpv.exec.run(["add", "secondary-sub-pos", incr]);
    var pos_apres = mpv.property.get_number("secondary-sub-pos");

    mpv.osd.print(
      "subtitle/pos-secondary> " +
        util.format.format_as_evolution(pos_avant, incr, pos_apres)
    );
  },
};

var activation = {
  /**
   * @param {integer} [offset]
   */
  navigate_primary: function (offset) {
    mpv.property.shift("sid", offset || +1);
    report.tracking.print_pretty_subtitle();
  },

  /**
   * @param {integer} [offset]
   */
  navigate_secondary: function (offset) {
    mpv.property.shift("secondary-sid", offset || +1);
    report.tracking.print_pretty_subtitle();
  },

  /**
   * @returns {boolean}
   */
  is_active_primary: function () {
    return mpv.property.get_boolean("sub-visibility");
  },

  /**
   * @returns {boolean}
   */
  is_active_secondary: function () {
    return mpv.property.get_boolean("secondary-sub-visibility");
  },

  toggle_primary: function () {
    mpv.property.cycle("sub-visibility");
    mpv.osd.print(
      "subtitle/visibility-primary> " +
        util.format.format_boolean(activation.is_active_primary())
    );
  },

  toggle_secondary: function () {
    mpv.property.cycle("secondary-sub-visibility");
    mpv.osd.print(
      "subtitle/visibility-secondary> " +
        util.format.format_boolean(activation.is_active_secondary())
    );
  },
};

module.exports = {
  timing: timing,
  sizing: sizing,
  position: position,
  activation: activation,
};
