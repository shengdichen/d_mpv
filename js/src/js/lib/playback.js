var util = require("../util");
var report = require("./report");
var mpv = require("./util");
var misc = require("./misc").export;

var MODULE = {};

MODULE.playpause = function () {
  mpv.property.cycle("pause");
  misc.osc.toggle();
};

MODULE.navigate_playlist = function (positive_dir) {
  return function () {
    if (positive_dir) {
      mpv.exec.run("playlist-next");
    } else {
      mpv.exec.run("playlist-prev");
    }
    report.playlist.print_pretty();
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
      mpv.exec.run("frame-step");
    } else {
      mpv.exec.run("frame-back-step");
    }
    mpv.osd.print(report.playback.progress());
  };
};

/**
 * @param {number} incr
 */
MODULE.navigate_file_time = function (incr) {
  return function () {
    mpv.exec.run(["seek", incr, "relative+exact"]);
    mpv.osd.print(report.playback.progress());
  };
};

/**
 * @param {integer} incr
 */
MODULE.navigate_file_chapter = function (incr) {
  return function () {
    mpv.exec.run(["add", "chapter", incr]);
    report.chapter.print_pretty();
  };
};

MODULE.adjust_speed = function (incr) {
  return function () {
    if (!incr) {
      mpv.exec.run(["set", "speed", 1.0]);
      mpv.osd.print("speed> 1.0");
    } else {
      mpv.exec.run(["add", "speed", incr]);
      mpv.osd.print(
        "speed> " +
          util.format.truncate_after_decimal(mpv.property.get_number("speed"))
      );
    }
  };
};

MODULE.loop_files = function () {
  mpv.property.cycle("loop-file", ["inf", "no"]);
  mpv.osd.print_prop_autotype("loop-file");
};

function _loop_ab_bound(mode) {
  var bound = mpv.property.get_autotype("ab-loop-" + mode);
  if (bound === "no") {
    return undefined;
  }
  return util.format.truncate_after_decimal(bound, 3);
}

MODULE.loop_ab = function () {
  mpv.exec.run("ab-loop");

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
  mpv.osd.print("loop-ab> " + msg);
};

module.exports = {
  export: MODULE,
};
