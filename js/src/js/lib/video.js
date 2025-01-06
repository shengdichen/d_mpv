var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var activation = {
  /**
   * @param {integer} [incr]
   */
  navigate: function (incr) {
    mpv.property.shift("video", incr || +1);
    report.tracking.print_pretty_video();
  },

  enable: function () {
    if (activation.is_active()) return;
    mpv.property.set_string("vid", "auto");
  },

  disable: function () {
    if (!activation.is_active()) return;
    mpv.property.set_boolean("vid", false);
  },

  /**
   * @returns {boolean}
   */
  is_active: function () {
    return mpv.property.get_autotype("vid") !== false;
  },
};

var position = {
  /**
   * @returns {string}
   */
  get_x: function () {
    return util.format.format_float(mpv.property.get_number("video-pan-x"), {
      prepend_sign: true,
      n_digits_after_decimal: 3,
    });
  },

  /**
   * @returns {string}
   */
  get_y: function () {
    return util.format.format_float(mpv.property.get_number("video-pan-y"), {
      prepend_sign: true,
      n_digits_after_decimal: 3,
    });
  },

  /**
   * @param {number} [incr]
   */
  reposition_x: function (incr) {
    mpv.exec.run(["add", "video-pan-x", incr || +0.01]);
    mpv.osd.print(
      "video/pos> (" + position.get_x() + ", " + position.get_y() + ")"
    );
  },

  /**
   * @param {number} [incr]
   */
  reposition_y: function (incr) {
    mpv.exec.run(["add", "video-pan-y", incr || +0.01]);
    mpv.osd.print(
      "video/pos> (" + position.get_x() + ", " + position.get_y() + ")"
    );
  },
};

var sizing = {
  /**
   * @returns {string}
   */
  get_size: function () {
    return util.format.format_float(mpv.property.get_number("video-zoom"), {
      prepend_sign: true,
      n_digits_after_decimal: 2,
    });
  },

  /**
   * @param {number} [incr]
   */
  resize: function (incr) {
    mpv.exec.run(["add", "video-zoom", incr || +0.1]);
    mpv.osd.print("video/size> " + sizing.get_size());
  },
};

var decoration = {
  deinterlace: function () {
    mpv.property.cycle("deinterlace");
    mpv.osd.print(
      "video/deinterlace> " +
        util.format.format(mpv.property.get_autotype("deinterlace"))
    );
  },

  hwdec: function () {
    mpv.property.cycle("hwdec", ["auto", "nvdec", "nvdec-copy", "no"]);

    var strings = [
      "video/hwdec>",
      mpv.property.get_string("hwdec-current"),
      "[" + mpv.property.get_string("hwdec") + "]",
    ];
    mpv.osd.print(strings.join(" "));
  },

  fullscreen: function () {
    mpv.property.cycle("fullscreen");
  },

  rotate: function () {
    mpv.property.cycle("video-rotate", [90, 180, 270, 0]);
  },
};

module.exports = {
  activation: activation,
  position: position,
  sizing: sizing,
  decoration: decoration,
};
