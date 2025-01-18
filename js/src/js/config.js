var util = require("./util");

var lib_mpv = require("./lib/util");
var lib_report = require("./lib/report");
var lib_misc = require("./lib/misc");

var lib_video = require("./lib/video");
var lib_subtitle = require("./lib/subtitle");
var lib_audio = require("./lib/audio");
var lib_playback = require("./lib/playback");

function _video() {
  lib_mpv.keybind.bind("f", lib_video.decoration.fullscreen);
  lib_mpv.keybind.bind("Ctrl+r", lib_video.decoration.rotate);

  lib_mpv.keybind.bind("-", function () {
    lib_video.activation.navigate(+1);
  });
  lib_mpv.keybind.bind("_", function () {
    lib_video.activation.navigate(-1);
  });

  var reposition_step = 0.025;
  lib_mpv.keybind.bind("Alt+LEFT", function () {
    lib_video.position.reposition_x(+reposition_step);
  });
  lib_mpv.keybind.bind("Alt+RIGHT", function () {
    lib_video.position.reposition_x(-reposition_step);
  });
  lib_mpv.keybind.bind("Alt+UP", function () {
    lib_video.position.reposition_y(+reposition_step);
  });
  lib_mpv.keybind.bind("Alt+DOWN", function () {
    lib_video.position.reposition_y(-reposition_step);
  });

  lib_mpv.keybind.bind("+", function () {
    lib_video.sizing.resize(-0.1);
  });
  lib_mpv.keybind.bind("=", function () {
    lib_video.sizing.resize(+0.1);
  });

  lib_mpv.keybind.bind("d", lib_video.decoration.deinterlace);
  lib_mpv.keybind.bind("Ctrl+h", lib_video.decoration.hwdec);
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
  lib_mpv.keybind.bind("9", function () {
    lib_audio.volume.shift(-1);
  });
  lib_mpv.keybind.bind("(", function () {
    lib_audio.volume.shift(-7);
  });
  lib_mpv.keybind.bind("0", function () {
    lib_audio.volume.shift(+1);
  });
  lib_mpv.keybind.bind(")", function () {
    lib_audio.volume.shift(+7);
  });

  lib_mpv.keybind.bind("8", lib_audio.volume.mute);

  lib_mpv.keybind.bind("3", function () {
    lib_audio.activation.navigate(+1);
  });
  lib_mpv.keybind.bind("SHARP", function () {
    lib_audio.activation.navigate(-1);
  });
}

function _playback() {
  lib_mpv.keybind.bind("SPACE", lib_playback.playpause.toggle);

  lib_mpv.keybind.bind("<", function () {
    lib_playback.playlist.shift(-1);
  });
  lib_mpv.keybind.bind(">", function () {
    lib_playback.playlist.shift(+1);
  });
  lib_mpv.keybind.bind("k", lib_report.playlist.print_pretty);
  lib_mpv.keybind.bind("Shift+k", lib_report.playlist.print_raw);

  lib_mpv.keybind.bind("j", lib_report.tracking.print_pretty);
  lib_mpv.keybind.bind("Shift+j", lib_report.tracking.print_raw);

  lib_mpv.keybind.bind("l", lib_playback.loop.loop_ab);
  lib_mpv.keybind.bind("L", lib_playback.loop.loop_files);

  lib_mpv.keybind.bind(",", function () {
    lib_playback.navigate.frame(-1);
  });
  lib_mpv.keybind.bind(".", function () {
    lib_playback.navigate.frame(+1);
  });

  lib_mpv.keybind.bind("LEFT", function () {
    lib_playback.navigate.time(-3);
  });
  lib_mpv.keybind.bind("RIGHT", function () {
    lib_playback.navigate.time(+3);
  });
  lib_mpv.keybind.bind("Shift+LEFT", function () {
    lib_playback.navigate.time(-1);
  });
  lib_mpv.keybind.bind("Shift+RIGHT", function () {
    lib_playback.navigate.time(+1);
  });
  lib_mpv.keybind.bind("Ctrl+LEFT", function () {
    lib_playback.navigate.time(-7);
  });
  lib_mpv.keybind.bind("Ctrl+RIGHT", function () {
    lib_playback.navigate.time(+7);
  });

  lib_mpv.keybind.bind("PGUP", function () {
    lib_playback.navigate.chapter(-1);
  });
  lib_mpv.keybind.bind("PGDWN", function () {
    lib_playback.navigate.chapter(+1);
  });

  lib_mpv.keybind.bind("[", function () {
    lib_playback.speed.shift(-0.1);
  });
  lib_mpv.keybind.bind("]", function () {
    lib_playback.speed.shift(+0.1);
  });
  lib_mpv.keybind.bind("BS", function () {
    lib_playback.speed.set();
  });
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

    lib_mpv.keybind.bind("Ctrl+s", lib_misc.record.save);
    lib_mpv.keybind.bind("Ctrl+Shift+s", lib_misc.record.toggle);
    lib_mpv.keybind.bind("Ctrl+q", lib_misc.record.save_quit);
  }

  title();
  savepos();
}

module.exports = function () {
  _video();
  _subtitle();
  _audio();
  _playback();
  _misc();
};
