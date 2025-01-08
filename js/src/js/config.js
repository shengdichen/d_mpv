var util = require("./util");

var lib_mpv = require("./lib/util");
var lib_report = require("./lib/report");
var lib_misc = require("./lib/misc");

var lib_video = require("./lib/video").export;
var lib_subtitle = require("./lib/subtitle").export;
var lib_audio = require("./lib/audio").export;
var lib_playback = require("./lib/playback").export;

function _video() {
  lib_mpv.keybind.bind("f", function () {
    lib_mpv.property.cycle("fullscreen");
  });
  lib_mpv.keybind.bind("Ctrl+r", function () {
    lib_mpv.property.cycle("video-rotate", [90, 180, 270, 0]);
  });

  lib_mpv.keybind.bind("_", lib_video.navigate);

  var reposition_step = 0.025;
  lib_mpv.keybind.bind("Alt+LEFT", lib_video.reposition(+reposition_step, "x"));
  lib_mpv.keybind.bind(
    "Alt+RIGHT",
    lib_video.reposition(-reposition_step, "x")
  );
  lib_mpv.keybind.bind("Alt+UP", lib_video.reposition(+reposition_step, "y"));
  lib_mpv.keybind.bind("Alt+DOWN", lib_video.reposition(-reposition_step, "y"));

  lib_mpv.keybind.bind("Alt+-", lib_video.resize(-0.1));
  lib_mpv.keybind.bind("Alt++", lib_video.resize(+0.1));

  lib_mpv.keybind.bind("d", lib_video.deinterlace(-0.1));
  lib_mpv.keybind.bind("Ctrl+h", lib_video.hwdec);
}

function _subtitle() {
  lib_mpv.keybind.bind("z", lib_subtitle.retime(+0.1, "primary"));
  lib_mpv.keybind.bind("x", lib_subtitle.retime(-0.1, "primary"));
  lib_mpv.keybind.bind("Shift+z", lib_subtitle.retime(+0.1, "secondary"));
  lib_mpv.keybind.bind("Shift+x", lib_subtitle.retime(-0.1, "secondary"));
  lib_mpv.keybind.bind("Ctrl+Shift+z", lib_subtitle.retime(+0.1, "both"));
  lib_mpv.keybind.bind("Ctrl+Shift+x", lib_subtitle.retime(-0.1, "both"));

  lib_mpv.keybind.bind("Shift+g", lib_subtitle.resize(-0.1));
  lib_mpv.keybind.bind("g", lib_subtitle.resize(+0.1));

  lib_mpv.keybind.bind("Shift+t", lib_subtitle.move_up());
  lib_mpv.keybind.bind("t", lib_subtitle.move_down());

  lib_mpv.keybind.bind("Shift+b", lib_subtitle.navigate_prev());
  lib_mpv.keybind.bind("b", lib_subtitle.navigate_next());

  lib_mpv.keybind.bind("v", lib_subtitle.toggle("primary"));
  lib_mpv.keybind.bind("Shift+v", lib_subtitle.toggle("secondary"));
  lib_mpv.keybind.bind("Alt+v", lib_subtitle.toggle("both"));
}

function _audio() {
  lib_mpv.keybind.bind("9", lib_audio.volume(-1));
  lib_mpv.keybind.bind("(", lib_audio.volume(-7));
  lib_mpv.keybind.bind("0", lib_audio.volume(+1));
  lib_mpv.keybind.bind(")", lib_audio.volume(+7));

  lib_mpv.keybind.bind("m", lib_audio.mute);

  lib_mpv.keybind.bind("SHARP", lib_audio.navigate);
}

function _playback() {
  lib_mpv.keybind.bind("SPACE", lib_playback.playpause.toggle);

  lib_mpv.keybind.bind("<", lib_playback.navigate_playlist(false));
  lib_mpv.keybind.bind(">", lib_playback.navigate_playlist(true));
  lib_mpv.keybind.bind("k", lib_report.playlist.print_pretty);
  lib_mpv.keybind.bind("Shift+k", lib_report.playlist.print_raw);

  lib_mpv.keybind.bind("j", lib_report.tracking.print_pretty);
  lib_mpv.keybind.bind("Shift+j", lib_report.tracking.print_raw);

  lib_mpv.keybind.bind("l", lib_playback.loop_ab);
  lib_mpv.keybind.bind("L", lib_playback.loop_files);

  lib_mpv.keybind.bind(",", lib_playback.navigate_file_frame(-1));
  lib_mpv.keybind.bind(".", lib_playback.navigate_file_frame(+1));

  lib_mpv.keybind.bind("LEFT", lib_playback.navigate_file_time(-3));
  lib_mpv.keybind.bind("RIGHT", lib_playback.navigate_file_time(+3));
  lib_mpv.keybind.bind("Shift+LEFT", lib_playback.navigate_file_time(-1));
  lib_mpv.keybind.bind("Shift+RIGHT", lib_playback.navigate_file_time(+1));
  lib_mpv.keybind.bind("Ctrl+LEFT", lib_playback.navigate_file_time(-7));
  lib_mpv.keybind.bind("Ctrl+RIGHT", lib_playback.navigate_file_time(+7));

  lib_mpv.keybind.bind("PGUP", lib_playback.navigate_file_chapter(-1));
  lib_mpv.keybind.bind("PGDWN", lib_playback.navigate_file_chapter(+1));

  lib_mpv.keybind.bind("[", lib_playback.adjust_speed(-0.1));
  lib_mpv.keybind.bind("]", lib_playback.adjust_speed(+0.1));
  lib_mpv.keybind.bind("BS", lib_playback.adjust_speed());
}

function _misc() {
  lib_mpv.keybind.bind("i", lib_misc.osc.toggle);
  lib_mpv.keybind.bind("I", lib_misc.stats.toggle);
  lib_mpv.keybind.bind("`", lib_misc.console.enable);
  lib_mpv.keybind.bind("Shift+s", lib_misc.screenshot);

  function title() {
    var title = "";

    var server = lib_mpv.property.get_string("input-ipc-server");
    if (server) {
      title += "[" + util.path.name(server) + "] ";
    }

    title += "${filename}";
    lib_mpv.property.set_string("title", title);
  }

  function savepos() {
    lib_misc.record.save_filename_only();
    lib_misc.record.append_targets("secondary-sub-delay");

    lib_mpv.keybind.bind("Ctrl+s", lib_misc.record.save);
    lib_mpv.keybind.bind("Ctrl+Shift+s", lib_misc.record.toggle);
    lib_mpv.keybind.bind("Ctrl+q", lib_misc.record.save_quit);
  }

  title();
  savepos();
}

function config() {
  _video();
  _subtitle();
  _audio();
  _playback();
  _misc();
}

module.exports = {
  export: config,
};
