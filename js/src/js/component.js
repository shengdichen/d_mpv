var util_mpv = require("./lib/util").export;
var report = require("./lib/report").export;

var lib_video = require("./lib/video").export;
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

var lib_audio = require("./lib/audio").export;
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

var lib_subtitle = require("./lib/subtitle").export;
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

var lib_playback = require("./lib/playback").export;
var playback = {
  config: function () {
    lib_playback.title();
    lib_playback.savepos();
  },

  bind: function () {
    util_mpv.bind("<", lib_playback.navigate_playlist(false));
    util_mpv.bind(">", lib_playback.navigate_playlist(true));
    util_mpv.bind("k", report.report_playlist);
    util_mpv.bind("Shift+k", function () {
      util_mpv.print_prop("playlist", "string");
    });

    util_mpv.bind("j", report.report_categories);
    util_mpv.bind("Shift+j", function () {
      util_mpv.print_prop("track-list", "string");
    });

    util_mpv.bind("l", lib_playback.loop_ab);
    util_mpv.bind("L", lib_playback.loop_files);

    util_mpv.bind(",", lib_playback.navigate_file(-1, "frame"));
    util_mpv.bind(".", lib_playback.navigate_file(+1, "frame"));

    util_mpv.bind("LEFT", lib_playback.navigate_file(-3));
    util_mpv.bind("RIGHT", lib_playback.navigate_file(+3));
    util_mpv.bind("UP", lib_playback.navigate_file(-7));
    util_mpv.bind("DOWN", lib_playback.navigate_file(+7));
    util_mpv.bind("PGUP", lib_playback.navigate_file(-1, "chapter"));
    util_mpv.bind("PGDWN", lib_playback.navigate_file(+1, "chapter"));

    util_mpv.bind("Shift+s", lib_playback.screenshot);

    util_mpv.bind("[", lib_playback.adjust_speed(-0.1));
    util_mpv.bind("]", lib_playback.adjust_speed(+0.1));
    util_mpv.bind("BS", lib_playback.adjust_speed());

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
  },
};

var misc = function () {
  util_mpv.raw.add_forced_key_binding("i", require("./lib/osc").export.toggle);
};

module.exports = {
  video: video,
  audio: audio,
  subtitle: subtitle,
  playback: playback,
  misc: misc,
};
