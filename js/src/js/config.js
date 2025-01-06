var util = require("./util");

var lib_mpv = require("./lib/util");
var lib_report = require("./lib/report");
var lib_misc = require("./lib/misc");

var lib_video = require("./lib/video").export;
var lib_subtitle = require("./lib/subtitle");
var lib_audio = require("./lib/audio").export;
var lib_playback = require("./lib/playback").export;

function _video() {
  lib_mpv.keybind.bind("f", lib_video.fullscreen);
  lib_mpv.keybind.bind("Ctrl+r", lib_video.rotate);

  lib_mpv.keybind.bind("-", function () {
    lib_video.navigate(+1);
  });
  lib_mpv.keybind.bind("_", function () {
    lib_video.navigate(-1);
  });

  var reposition_step = 0.025;
  lib_mpv.keybind.bind("Alt+LEFT", function () {
    lib_video.reposition(+reposition_step, "x");
  });
  lib_mpv.keybind.bind("Alt+RIGHT", function () {
    lib_video.reposition(-reposition_step, "x");
  });
  lib_mpv.keybind.bind("Alt+UP", function () {
    lib_video.reposition(+reposition_step, "y");
  });
  lib_mpv.keybind.bind("Alt+DOWN", function () {
    lib_video.reposition(-reposition_step, "y");
  });

  lib_mpv.keybind.bind("Alt+-", function () {
    lib_video.resize(-0.1);
  });
  lib_mpv.keybind.bind("Alt++", function () {
    lib_video.resize(+0.1);
  });

  lib_mpv.keybind.bind("d", lib_video.deinterlace);
  lib_mpv.keybind.bind("Ctrl+h", lib_video.hwdec);
}

function _subtitle() {
  lib_mpv.keybind.bind("Shift+z", function () {
    lib_subtitle.timing.retime(-0.1, "secondary");
  });
  lib_mpv.keybind.bind("z", function () {
    lib_subtitle.timing.retime(+0.1, "secondary");
  });
  lib_mpv.keybind.bind("Shift+x", function () {
    lib_subtitle.timing.retime(-0.1, "primary");
  });
  lib_mpv.keybind.bind("x", function () {
    lib_subtitle.timing.retime(+0.1, "primary");
  });

  lib_mpv.keybind.bind("Shift+c", function () {
    lib_subtitle.sizing.resize(-0.1);
  });
  lib_mpv.keybind.bind("c", function () {
    lib_subtitle.sizing.resize(+0.1);
  });

  lib_mpv.keybind.bind("Shift+v", function () {
    lib_subtitle.position.move_secondary(-1);
  });
  lib_mpv.keybind.bind("v", function () {
    lib_subtitle.position.move_secondary(+1);
  });
  lib_mpv.keybind.bind("Shift+b", function () {
    lib_subtitle.position.move_primary(-1);
  });
  lib_mpv.keybind.bind("b", function () {
    lib_subtitle.position.move_primary(+1);
  });

  lib_mpv.keybind.bind("Shift+n", function () {
    lib_subtitle.activation.navigate_secondary(-1);
  });
  lib_mpv.keybind.bind("n", function () {
    lib_subtitle.activation.navigate_secondary(+1);
  });
  lib_mpv.keybind.bind("Ctrl+n", lib_subtitle.activation.toggle_secondary);
  lib_mpv.keybind.bind("Shift+m", function () {
    lib_subtitle.activation.navigate_primary(-1);
  });
  lib_mpv.keybind.bind("m", function () {
    lib_subtitle.activation.navigate_primary(+1);
  });
  lib_mpv.keybind.bind("Ctrl+m", lib_subtitle.activation.toggle_primary);
}

function _audio() {
  lib_mpv.keybind.bind("9", lib_audio.volume(-1));
  lib_mpv.keybind.bind("(", lib_audio.volume(-7));
  lib_mpv.keybind.bind("0", lib_audio.volume(+1));
  lib_mpv.keybind.bind(")", lib_audio.volume(+7));

  lib_mpv.keybind.bind("8", lib_audio.mute);

  lib_mpv.keybind.bind("3", function () {
    lib_audio.navigate(+1);
  });
  lib_mpv.keybind.bind("SHARP", function () {
    lib_audio.navigate(-1);
  });
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
