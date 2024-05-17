var util_misc = require("../util").util;
var report = require("./report").report;
var util = require("./util").util;

var MODULE = {};

MODULE.navigate_playlist = function (positive_dir) {
  return function () {
    if (positive_dir) {
      util.run(["playlist-next"]);
    } else {
      util.run(["playlist-prev"]);
    }
    report.report_playlist();
  };
};

MODULE.navigate_file = function (incr, mode) {
  return function () {
    if (mode === "chapter") {
      util.run(["add", "chapter", incr]);
      report.report_chapter();
    } else if (mode === "frame") {
      if (incr > 0) {
        util.run(["frame-step"]);
      } else {
        util.run(["frame-back-step"]);
      }
    } else {
      util.run(["seek", incr, "relative+exact"]);
    }

    var current = util.get_prop("playback-time", "raw");
    var duration = util.get_prop("duration", "raw");
    util.print_osd("time> " + current + "/" + duration);
  };
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
          util_misc.truncate_after_decimal(util.get_prop("speed", "num"))
      );
    }
  };
};

MODULE.loop_files = function () {
  util.cycle("loop-file", ["inf", "no"]);
  util.print_prop("loop-file");
};

function _loop_ab_bound(mode) {
  var bound = util.get_prop("ab-loop-" + mode);
  if (bound === "no") {
    return undefined;
  }
  return util_misc.truncate_after_decimal(bound, 3);
}

MODULE.loop_ab = function () {
  util.run(["ab-loop"]);

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

MODULE.screenshot = function () {
  util.run(["screenshot"]);
};

MODULE.savepos = function () {
  util.set_prop("write-filename-in-watch-later-config", true);
  util.set_prop("ignore-path-in-watch-later-config", true);

  util.set_prop(
    "watch-later-options",
    [
      util.get_prop("watch-later-options", "string"),
      "secondary-sub-delay",
    ].join(",")
  );

  util.bind("Ctrl+s", function () {
    util.cycle("save-position-on-quit");
    util.print_osd(
      "savepos> " + (util.get_prop("save-position-on-quit") ? "T" : "F")
    );
  });
  util.bind("Ctrl+q", function () {
    util.run(["quit-watch-later"]);
  });
};

MODULE.title = function () {
  var title = "";

  var server = util.get_prop("input-ipc-server");
  if (server) {
    // show only filename of socket
    title = title.concat("[" + server.split("/").slice(-1).toString() + "] ");
  }

  title = title.concat("${path}");
  util.set_prop("title", title);
};

module.exports = {
  playback: MODULE,
};
