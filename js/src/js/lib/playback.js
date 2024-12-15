var util_misc = require("../util").export;
var report = require("./report").export;
var util = require("./util").export;
var misc = require("./misc").export;

var MODULE = {};

MODULE.playpause = function () {
  util.cycle("pause");
  misc.osc.toggle();
};

MODULE.navigate_playlist = function (positive_dir) {
  return function () {
    if (positive_dir) {
      util.run("playlist-next");
    } else {
      util.run("playlist-prev");
    }
    report.report_playlist();
  };
};

/**
 * @param {integer} incr
 */
MODULE.navigate_file_frame = function (incr) {
  return function () {
    if (incr === 0) {
      return;
    }

    if (incr > 0) {
      util.run("frame-step");
    } else {
      util.run("frame-back-step");
    }
    util.print_osd(MODULE._format_time());
  };
};

/**
 * @param {number} incr
 */
MODULE.navigate_file_time = function (incr) {
  return function () {
    util.run(["seek", incr, "relative+exact"]);
    util.print_osd(MODULE._format_time());
  };
};

/**
 * @param {integer} incr
 */
MODULE.navigate_file_chapter = function (incr) {
  return function () {
    util.run(["add", "chapter", incr]);
    report.report_chapter();
  };
};

/**
 * @returns {string}
 */
MODULE._format_time = function () {
  var current = util.get_prop_string_formatted("playback-time");
  var duration = util.get_prop_string_formatted("duration", "raw");
  return "time> " + current + "/" + duration;
};

MODULE.adjust_speed = function (incr) {
  return function () {
    if (!incr) {
      util.run(["set", "speed", 1.0]);
      util.print_osd("speed> 1.0");
    } else {
      util.run(["add", "speed", incr]);
      util.print_osd(
        "speed> " +
          util_misc.truncate_after_decimal(util.get_prop_number("speed"))
      );
    }
  };
};

MODULE.loop_files = function () {
  util.cycle("loop-file", ["inf", "no"]);
  util.print_prop_autotype("loop-file");
};

function _loop_ab_bound(mode) {
  var bound = util.get_prop_autotype("ab-loop-" + mode);
  if (bound === "no") {
    return undefined;
  }
  return util_misc.truncate_after_decimal(bound, 3);
}

MODULE.loop_ab = function () {
  util.run("ab-loop");

  var msg;
  var bound_a = _loop_ab_bound("a");
  var bound_b = _loop_ab_bound("b");

  if (bound_a) {
    if (bound_b) {
      msg = bound_a + " <--> " + bound_b;
    } else {
      msg = bound_a + " ->?";
    }
  } else {
    msg = "?";
  }
  util.print_osd("loop-ab> " + msg);
};

module.exports = {
  export: MODULE,
};
