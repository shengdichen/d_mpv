var util_misc = require("../util").export;
var report = require("./report").export;
var util = require("./util").export;

var MODULE = {};

MODULE.navigate = function () {
  util.cycle("video");
  report.tracking.print_pretty_video();
};

function _position(dimension) {
  return util_misc.format.prepend_sign(
    util_misc.format.truncate_after_decimal(
      util.get_prop_number("video-pan-" + dimension)
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
    util.run(["add", "video-pan-" + dimension, incr]);
    util.print_osd(
      "video/pos> (" + _position("x") + ", " + _position("y") + ")"
    );
  };
};

function _size() {
  return util_misc.format.prepend_sign(
    util_misc.format.truncate_after_decimal(util.get_prop_number("video-zoom"))
  );
}
/**
 * @param {number} [incr]
 * @returns {function(): void}
 */
MODULE.resize = function (incr) {
  return function () {
    util.run(["add", "video-zoom", incr]);
    util.print_osd("video/size> " + _size());
  };
};

/**
 * @returns {function(): void}
 */
MODULE.deinterlace = function () {
  return function () {
    util.cycle("deinterlace");
    util.print_osd(
      "video/deinterlace> " + util.get_prop_autotype("deinterlace")
    );
  };
};

/**
 * @returns {function(): void}
 */
MODULE.hwdec = function () {
  util.cycle("hwdec", ["auto", "nvdec", "nvdec-copy", "no"]);
  util.print_osd(
    "video/hwdec> " +
      util.get_prop_string("hwdec-current") +
      " [" +
      util.get_prop_string("hwdec") +
      "]"
  );
};

module.exports = {
  export: MODULE,
};
