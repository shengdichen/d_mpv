var util = require("./util");
var util_misc = util.util_misc;
var util_mpv = util.util_mpv;
var report = util.report;

var lib_video = require("./lib/video").video;
var video = {
  config: function () {},

  bind: function () {
    util_mpv.bind("SPACE", function () {
      util_mpv.cycle("pause");
    });
    util_mpv.bind("f", function () {
      util_mpv.cycle("fullscreen");
    });
    util_mpv.bind("Ctrl+r", function () {
      util_mpv.cycle("video-rotate", [90, 180, 270, 0]);
    });

    util_mpv.bind("_", lib_video.navigate);

    util_mpv.bind("Alt+LEFT", lib_video.reposition(+0.1, "x"));
    util_mpv.bind("Alt+RIGHT", lib_video.reposition(-0.1, "x"));
    util_mpv.bind("Alt+UP", lib_video.reposition(+0.1, "y"));
    util_mpv.bind("Alt+DOWN", lib_video.reposition(-0.1, "y"));

    util_mpv.bind("Alt+-", lib_video.resize(-0.1));
    util_mpv.bind("Alt++", lib_video.resize(+0.1));

    util_mpv.bind("d", lib_video.deinterlace(-0.1));
    util_mpv.bind("Ctrl+h", lib_video.hwdec);
  },
};

var lib_audio = require("./lib/audio").audio;
var audio = {
  config: function () {},

  bind: function () {
    util_mpv.bind("9", lib_audio.volume(-1));
    util_mpv.bind("(", lib_audio.volume(-7));
    util_mpv.bind("0", lib_audio.volume(+1));
    util_mpv.bind(")", lib_audio.volume(+7));

    util_mpv.bind("m", lib_audio.mute);

    util_mpv.bind("SHARP", lib_audio.navigate);
  },
};

var lib_subtitle = require("./lib/subtitle").subtitle;
var subtitle = {
  bind: function () {
    util_mpv.bind("z", lib_subtitle.retime(+0.1, "primary"));
    util_mpv.bind("x", lib_subtitle.retime(-0.1, "primary"));
    util_mpv.bind("Z", lib_subtitle.retime(+0.1, "secondary"));
    util_mpv.bind("X", lib_subtitle.retime(-0.1, "secondary"));

    util_mpv.bind("Shift+g", lib_subtitle.resize(-0.1));
    util_mpv.bind("g", lib_subtitle.resize(+0.1));

    util_mpv.bind("Shift+t", lib_subtitle.reposition(-1));
    util_mpv.bind("t", lib_subtitle.reposition(+1));

    util_mpv.bind("b", lib_subtitle.navigate(true));
    util_mpv.bind("Shift+b", lib_subtitle.navigate(false));

    util_mpv.bind("v", lib_subtitle.toggle("primary"));
    util_mpv.bind("Shift+v", lib_subtitle.toggle("secondary"));
    util_mpv.bind("Alt+v", lib_subtitle.toggle("both"));
  },
};

var playback = new (function () {
  this.navigate_playlist = function (positive_dir) {
    return function () {
      if (positive_dir) {
        util_mpv.run(["playlist-next"]);
      } else {
        util_mpv.run(["playlist-prev"]);
      }
      report.report_playlist();
    };
  };

  this.navigate_file = function (incr, mode) {
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

      var current = util_mpv.get_prop("playback-time", (type = "raw"));
      var duration = util_mpv.get_prop("duration", (type = "raw"));
      util_mpv.print_osd("time> " + current + "/" + duration);
    };
  };

  this.adjust_speed = function (incr) {
    return function () {
      if (!incr) {
        util_mpv.run(["set", "speed", 1.0]);
        util_mpv.print_osd("speed> 1.0");
      } else {
        util_mpv.run(["add", "speed", incr]);
        util_mpv.print_osd(
          "speed> " +
            util_misc.truncate_after_decimal(
              util_mpv.get_prop("speed", (type = "num"))
            )
        );
      }
    };
  };

  this.loop_files = function () {
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

  this.loop_ab = function () {
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

  this.screenshot = function () {
    util_mpv.run(["screenshot"]);
  };

  this.savepos = function () {
    util_mpv.set_prop("write-filename-in-watch-later-config", true);
    util_mpv.set_prop("ignore-path-in-watch-later-config", true);

    util_mpv.set_prop(
      "watch-later-options",
      [
        util_mpv.get_prop("watch-later-options", (type = "string")),
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

  this.title = function () {
    var title = "";

    var server = util_mpv.get_prop("input-ipc-server");
    if (server) {
      // show only filename of socket
      title = title.concat("[" + server.split("/").slice(-1).toString() + "] ");
    }

    title = title.concat("${path}");
    util_mpv.set_prop("title", title);
  };

  this.bind = function () {
    util_mpv.bind("<", this.navigate_playlist((positive_dir = false)));
    util_mpv.bind(">", this.navigate_playlist((positive_dir = true)));
    util_mpv.bind("k", report.report_playlist);
    util_mpv.bind("Shift+k", function () {
      util_mpv.print_prop("playlist", (type = "string"));
    });

    util_mpv.bind("j", report.report_categories);
    util_mpv.bind("Shift+j", function () {
      util_mpv.print_prop("track-list", (type = "string"));
    });

    util_mpv.bind("l", this.loop_ab);
    util_mpv.bind("L", this.loop_files);

    util_mpv.bind(",", this.navigate_file(-1, (mode = "frame")));
    util_mpv.bind(".", this.navigate_file(+1, (mode = "frame")));

    util_mpv.bind("LEFT", this.navigate_file(-3));
    util_mpv.bind("RIGHT", this.navigate_file(+3));
    util_mpv.bind("UP", this.navigate_file(-7));
    util_mpv.bind("DOWN", this.navigate_file(+7));
    util_mpv.bind("PGUP", this.navigate_file(-1, (mode = "chapter")));
    util_mpv.bind("PGDWN", this.navigate_file(+1, (mode = "chapter")));

    util_mpv.bind("Shift+s", this.screenshot);

    util_mpv.bind("[", this.adjust_speed(-0.1));
    util_mpv.bind("]", this.adjust_speed(+0.1));
    util_mpv.bind("BS", this.adjust_speed());

    util_mpv.bind("I", function () {
      // REF:
      // https://github.com/Argon-/mpv-stats/blob/master/stats.lua
      // https://github.com/mpv-player/mpv/blob/master/player/lua/stats.lua
      util_mpv.run_script_bind("stats", "display-stats-toggle");
    });
    util_mpv.bind("`", function () {
      // REF:
      // https://github.com/mpv-player/mpv/blob/master/player/lua/console.lua
      util_mpv.run_script_bind("console", "enable");
    });
  };
})();

var misc = function () {
  util_mpv.raw.add_forced_key_binding("i", require("./lib/osc").osc.toggle);
};

module.exports = {
  video: video,
  audio: audio,
  subtitle: subtitle,
  playback: playback,
  misc: misc,
};
