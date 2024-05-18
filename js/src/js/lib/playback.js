var util_misc = require("../util").export;
var report = require("./report").export;
var util = require("./util").export;

var MODULE = {};

MODULE.playpause = function () {
  util.cycle("pause");
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

MODULE.navigate_file = function (incr, mode) {
  return function () {
    if (mode === "chapter") {
      util.run(["add", "chapter", incr]);
      report.report_chapter();
    } else if (mode === "frame") {
      if (incr > 0) {
        util.run("frame-step");
      } else {
        util.run("frame-back-step");
      }
    } else {
      util.run(["seek", incr, "relative+exact"]);
    }

    var current = util.get_prop_string_formatted("playback-time");
    var duration = util.get_prop_string_formatted("duration", "raw");
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
          util_misc.truncate_after_decimal(util.get_prop_number("speed"))
      );
    }
  };
};

MODULE.loop_files = function () {
  util.cycle("loop-file", ["inf", "no"]);
  util.print_prop("loop-file");
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

MODULE.config = function () {
  util.bind("SPACE", MODULE.playpause);

  util.bind("<", MODULE.navigate_playlist(false));
  util.bind(">", MODULE.navigate_playlist(true));
  util.bind("k", report.report_playlist);
  util.bind("Shift+k", function () {
    util.print_prop("playlist", "string");
  });

  util.bind("j", report.report_categories);
  util.bind("Shift+j", function () {
    util.print_prop("track-list", "string");
  });

  util.bind("l", MODULE.loop_ab);
  util.bind("L", MODULE.loop_files);

  util.bind(",", MODULE.navigate_file(-1, "frame"));
  util.bind(".", MODULE.navigate_file(+1, "frame"));

  util.bind("LEFT", MODULE.navigate_file(-3));
  util.bind("RIGHT", MODULE.navigate_file(+3));
  util.bind("UP", MODULE.navigate_file(-7));
  util.bind("DOWN", MODULE.navigate_file(+7));
  util.bind("PGUP", MODULE.navigate_file(-1, "chapter"));
  util.bind("PGDWN", MODULE.navigate_file(+1, "chapter"));

  util.bind("[", MODULE.adjust_speed(-0.1));
  util.bind("]", MODULE.adjust_speed(+0.1));
  util.bind("BS", MODULE.adjust_speed());
};

module.exports = {
  export: MODULE,
};
