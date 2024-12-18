var util_misc = require("../util");
var report = require("./report");
var util = require("./util");

var MODULE = {};

MODULE.navigate = function () {
  util.property.cycle("video");
  report.tracking.print_pretty_video();
};

function _position(dimension) {
  return util_misc.format.prepend_sign(
    util_misc.format.truncate_after_decimal(
      util.property.get_number("video-pan-" + dimension)
    )
  );
}
/**
 * @param {number} [incr]
 * @param {string} [dimension]
 * @returns {function(): void}
 */
MODULE.reposition = function (incr, dimension) {
  return function () {
    util.exec.run(["add", "video-pan-" + dimension, incr]);
    util.osd.print(
      "video/pos> (" + _position("x") + ", " + _position("y") + ")"
    );
  };
};

function _size() {
  return util_misc.format.prepend_sign(
    util_misc.format.truncate_after_decimal(
      util.property.get_number("video-zoom")
    )
  );
}
/**
 * @param {number} [incr]
 * @returns {function(): void}
 */
MODULE.resize = function (incr) {
  return function () {
    util.exec.run(["add", "video-zoom", incr]);
    util.osd.print("video/size> " + _size());
  };
};

/**
 * @returns {function(): void}
 */
MODULE.deinterlace = function () {
  return function () {
    util.property.cycle("deinterlace");
    util.osd.print(
      "video/deinterlace> " + util.property.get_autotype("deinterlace")
    );
  };
};

/**
 * @returns {function(): void}
 */
MODULE.hwdec = function () {
  util.property.cycle("hwdec", ["auto", "nvdec", "nvdec-copy", "no"]);
  util.osd.print(
    "video/hwdec> " +
      util.property.get_string("hwdec-current") +
      " [" +
      util.property.get_string("hwdec") +
      "]"
  );
};

module.exports = {
  export: MODULE,
};
