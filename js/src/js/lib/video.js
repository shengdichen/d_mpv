var util_misc = require("../util").export;
var report = require("./report").export;
var util = require("./util").export;

var MODULE = {};

MODULE.navigate = function () {
  util.cycle("video");
  report.report_category_video();
};

function _position(dimension) {
  return util_misc.prepend_sign(
    util_misc.truncate_after_decimal(
      util.get_prop_number("video-pan-" + dimension)
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
    util_misc.truncate_after_decimal(util.get_prop_number("video-zoom"))
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
    util.print_osd(
      "video/deinterlace> " + util.get_prop_autotype("deinterlace")
    );
  };
};

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

MODULE.config = function () {
  util.bind("f", function () {
    util.cycle("fullscreen");
  });
  util.bind("Ctrl+r", function () {
    util.cycle("video-rotate", [90, 180, 270, 0]);
  });

  util.bind("_", MODULE.navigate);

  util.bind("Alt+LEFT", MODULE.reposition(+0.1, "x"));
  util.bind("Alt+RIGHT", MODULE.reposition(-0.1, "x"));
  util.bind("Alt+UP", MODULE.reposition(+0.1, "y"));
  util.bind("Alt+DOWN", MODULE.reposition(-0.1, "y"));

  util.bind("Alt+-", MODULE.resize(-0.1));
  util.bind("Alt++", MODULE.resize(+0.1));

  util.bind("d", MODULE.deinterlace(-0.1));
  util.bind("Ctrl+h", MODULE.hwdec);
};

module.exports = {
  export: MODULE,
};
