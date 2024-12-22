var util = require("../util");
var report = require("./report");
var mpv = require("./util");

var MODULE = {};

/**
 * @param {integer} [incr]
 */
MODULE.navigate = function (incr) {
  mpv.property.shift("video", incr || +1);
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
 */
MODULE.reposition = function (incr, dimension) {
  mpv.exec.run(["add", "video-pan-" + dimension, incr]);
  mpv.osd.print("video/pos> (" + _position("x") + ", " + _position("y") + ")");
};

function _size() {
  return util.format.format_float(mpv.property.get_number("video-zoom"), {
    prepend_sign: true,
    n_digits_after_decimal: 2,
  });
}
/**
 * @param {number} [incr]
 */
MODULE.resize = function (incr) {
  mpv.exec.run(["add", "video-zoom", incr]);
  mpv.osd.print("video/size> " + _size());
};

MODULE.deinterlace = function () {
  mpv.property.cycle("deinterlace");
  mpv.osd.print(
    "video/deinterlace> " + typeof mpv.property.get_autotype("deinterlace")
  );
};

MODULE.hwdec = function () {
  mpv.property.cycle("hwdec", ["auto", "nvdec", "nvdec-copy", "no"]);

  var strings = [
    "video/hwdec>",
    mpv.property.get_string("hwdec-current"),
    "[" + mpv.property.get_string("hwdec") + "]",
  ];
  mpv.osd.print(strings.join(" "));
};

MODULE.fullscreen = function () {
  mpv.property.cycle("fullscreen");
};

MODULE.rotate = function () {
  mpv.property.cycle("video-rotate", [90, 180, 270, 0]);
};

module.exports = {
  export: MODULE,
};
