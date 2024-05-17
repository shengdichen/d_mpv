var util = require("../util");
var util_misc = util.util_misc;
var report = util.report;
var util_mpv = require("./util").util;

var MODULE = {};

MODULE.navigate_playlist = function (positive_dir) {
  return function () {
    if (positive_dir) {
      util_mpv.run(["playlist-next"]);
    } else {
      util_mpv.run(["playlist-prev"]);
    }
    report.report_playlist();
  };
};

MODULE.navigate_file = function (incr, mode) {
  return function () {
    if (mode === "chapter") {
      util_mpv.run(["add", "chapter", incr]);
      report.report_chapter();
    } else if (mode === "frame") {
      if (incr > 0) {
        util_mpv.run(["frame-step"]);
      } else {
        util_mpv.run(["frame-back-step"]);
      }
    } else {
      util_mpv.run(["seek", incr, "relative+exact"]);
    }

    var current = util_mpv.get_prop("playback-time", "raw");
    var duration = util_mpv.get_prop("duration", "raw");
    util_mpv.print_osd("time> " + current + "/" + duration);
  };
};

MODULE.adjust_speed = function (incr) {
  return function () {
    if (!incr) {
      util_mpv.run(["set", "speed", 1.0]);
      util_mpv.print_osd("speed> 1.0");
    } else {
      util_mpv.run(["add", "speed", incr]);
      util_mpv.print_osd(
        "speed> " +
          util_misc.truncate_after_decimal(util_mpv.get_prop("speed", "num"))
      );
    }
  };
};

MODULE.loop_files = function () {
  util_mpv.cycle("loop-file", ["inf", "no"]);
  util_mpv.print_prop("loop-file");
};

function _loop_ab_bound(mode) {
  var bound = util_mpv.get_prop("ab-loop-" + mode);
  if (bound === "no") {
    return undefined;
  }
  return util_misc.truncate_after_decimal(bound, 3);
}

MODULE.loop_ab = function () {
  util_mpv.run(["ab-loop"]);

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
  util_mpv.print_osd("loop-ab> " + msg);
};

MODULE.screenshot = function () {
  util_mpv.run(["screenshot"]);
};

MODULE.savepos = function () {
  util_mpv.set_prop("write-filename-in-watch-later-config", true);
  util_mpv.set_prop("ignore-path-in-watch-later-config", true);

  util_mpv.set_prop(
    "watch-later-options",
    [
      util_mpv.get_prop("watch-later-options", "string"),
      "secondary-sub-delay",
    ].join(",")
  );

  util_mpv.bind("Ctrl+s", function () {
    util_mpv.cycle("save-position-on-quit");
    util_mpv.print_osd(
      "savepos> " + (util_mpv.get_prop("save-position-on-quit") ? "T" : "F")
    );
  });
  util_mpv.bind("Ctrl+q", function () {
    util_mpv.run(["quit-watch-later"]);
  });
};

MODULE.title = function () {
  var title = "";

  var server = util_mpv.get_prop("input-ipc-server");
  if (server) {
    // show only filename of socket
    title = title.concat("[" + server.split("/").slice(-1).toString() + "] ");
  }

  title = title.concat("${path}");
  util_mpv.set_prop("title", title);
};

module.exports = {
  playback: MODULE,
};
