var util_misc = require("../util").util;
var report = require("./report").report;
var util = require("./util").util;

var MODULE = {};

MODULE.navigate = function () {
  util.cycle("video");
  report.report_category_video();
};

function _position(dimension) {
  return util_misc.prepend_sign(
    util_misc.truncate_after_decimal(
      util.get_prop("video-pan-" + dimension, "num")
    )
  );
}
MODULE.reposition = function (incr, dimension) {
  return function () {
    util.run(["add", "video-pan-" + dimension, incr]);
    util.print_osd(
      "video/pos> (" + _position("x") + ", " + _position("y") + ")"
    );
  };
};

function _size() {
  return util_misc.prepend_sign(
    util_misc.truncate_after_decimal(util.get_prop("video-zoom", "num"))
  );
}
MODULE.resize = function (incr) {
  return function () {
    util.run(["add", "video-zoom", incr]);
    util.print_osd("video/size> " + _size());
  };
};

MODULE.deinterlace = function () {
  return function () {
    util.cycle("deinterlace");
    util.print_osd("video/deinterlace> " + util.get_prop("deinterlace"));
  };
};

MODULE.hwdec = function () {
  util.cycle("hwdec", ["auto", "nvdec", "nvdec-copy", "no"]);
  util.print_osd(
    "video/hwdec> " +
      util.get_prop("hwdec-current") +
      " [" +
      util.get_prop("hwdec") +
      "]"
  );
};

module.exports = {
  video: MODULE,
};
