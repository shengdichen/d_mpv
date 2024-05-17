var util = require("../util");
var util_misc = util.util_misc;
var report = util.report;
var util_mpv = require("./util").util;

var MODULE = {};

MODULE.navigate = function () {
  util_mpv.cycle("video");
  report.report_category_video();
};

function _position(dimension) {
  return util_misc.prepend_sign(
    util_misc.truncate_after_decimal(
      util_mpv.get_prop("video-pan-" + dimension, "num")
    )
  );
}
MODULE.reposition = function (incr, dimension) {
  return function () {
    util_mpv.run(["add", "video-pan-" + dimension, incr]);
    util_mpv.print_osd(
      "video/pos> (" + _position("x") + ", " + _position("y") + ")"
    );
  };
};

function _size() {
  return util_misc.prepend_sign(
    util_misc.truncate_after_decimal(util_mpv.get_prop("video-zoom", "num"))
  );
}
MODULE.resize = function (incr) {
  return function () {
    util_mpv.run(["add", "video-zoom", incr]);
    util_mpv.print_osd("video/size> " + _size());
  };
};

MODULE.deinterlace = function () {
  return function () {
    util_mpv.cycle("deinterlace");
    util_mpv.print_osd(
      "video/deinterlace> " + util_mpv.get_prop("deinterlace")
    );
  };
};

MODULE.hwdec = function () {
  util_mpv.cycle("hwdec", ["auto", "nvdec", "nvdec-copy", "no"]);
  util_mpv.print_osd(
    "video/hwdec> " +
      util_mpv.get_prop("hwdec-current") +
      " [" +
      util_mpv.get_prop("hwdec") +
      "]"
  );
};

module.exports = {
  video: MODULE,
};
