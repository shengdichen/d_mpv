var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var MODULE = {};

MODULE.navigate = function () {
  mpv.property.cycle("video");
  report.tracking.print_pretty_video();
};

MODULE.enable = function () {
  if (MODULE.is_active()) return;
  mpv.property.set_string("vid", "auto");
};

MODULE.disable = function () {
  if (!MODULE.is_active()) return;
  mpv.property.set_boolean("vid", false);
};

/**
 * @returns {boolean}
 */
MODULE.is_active = function () {
  return mpv.property.get_autotype("vid") !== false;
};

function _position(dimension) {
  return util.format.format_float(
    mpv.property.get_number("video-pan-" + dimension),
    { prepend_sign: true, n_digits_after_decimal: 3 }
  );
}
/**
 * @param {number} [incr]
 * @param {string} [dimension]
 * @returns {function(): void}
 */
MODULE.reposition = function (incr, dimension) {
  return function () {
    mpv.exec.run(["add", "video-pan-" + dimension, incr]);
    mpv.osd.print(
      "video/pos> (" + _position("x") + ", " + _position("y") + ")"
    );
  };
};

function _size() {
  return util.format.format_float(mpv.property.get_number("video-zoom"), {
    prepend_sign: true,
    n_digits_after_decimal: 2,
  });
}
/**
 * @param {number} [incr]
 * @returns {function(): void}
 */
MODULE.resize = function (incr) {
  return function () {
    mpv.exec.run(["add", "video-zoom", incr]);
    mpv.osd.print("video/size> " + _size());
  };
};

/**
 * @returns {function(): void}
 */
MODULE.deinterlace = function () {
  return function () {
    mpv.property.cycle("deinterlace");
    mpv.osd.print(
      "video/deinterlace> " + mpv.property.get_autotype("deinterlace")
    );
  };
};

/**
 * @returns {function(): void}
 */
MODULE.hwdec = function () {
  mpv.property.cycle("hwdec", ["auto", "nvdec", "nvdec-copy", "no"]);
  mpv.osd.print(
    "video/hwdec> " +
      mpv.property.get_string("hwdec-current") +
      " [" +
      mpv.property.get_string("hwdec") +
      "]"
  );
};

module.exports = {
  export: MODULE,
};
