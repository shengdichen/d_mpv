var lib_util = require("./lib/util").export;
var lib_report = require("./lib/report").export;

var lib_video = require("./lib/video").export;
var lib_subtitle = require("./lib/subtitle").export;
var lib_audio = require("./lib/audio").export;
var lib_playback = require("./lib/playback").export;
var lib_misc = require("./lib/misc").export;

function _video() {
  lib_util.bind("f", function () {
    lib_util.cycle("fullscreen");
  });
  lib_util.bind("Ctrl+r", function () {
    lib_util.cycle("video-rotate", [90, 180, 270, 0]);
  });

  lib_util.bind("_", lib_video.navigate);

  var reposition_step = 0.025;
  lib_util.bind("Alt+LEFT", lib_video.reposition(+reposition_step, "x"));
  lib_util.bind("Alt+RIGHT", lib_video.reposition(-reposition_step, "x"));
  lib_util.bind("Alt+UP", lib_video.reposition(+reposition_step, "y"));
  lib_util.bind("Alt+DOWN", lib_video.reposition(-reposition_step, "y"));

  lib_util.bind("Alt+-", lib_video.resize(-0.1));
  lib_util.bind("Alt++", lib_video.resize(+0.1));

  lib_util.bind("d", lib_video.deinterlace(-0.1));
  lib_util.bind("Ctrl+h", lib_video.hwdec);
}

function _subtitle() {
  lib_util.bind("z", lib_subtitle.retime(+0.1, "primary"));
  lib_util.bind("x", lib_subtitle.retime(-0.1, "primary"));
  lib_util.bind("Shift+z", lib_subtitle.retime(+0.1, "secondary"));
  lib_util.bind("Shift+x", lib_subtitle.retime(-0.1, "secondary"));
  lib_util.bind("Ctrl+Shift+z", lib_subtitle.retime(+0.1, "both"));
  lib_util.bind("Ctrl+Shift+x", lib_subtitle.retime(-0.1, "both"));

  lib_util.bind("Shift+g", lib_subtitle.resize(-0.1));
  lib_util.bind("g", lib_subtitle.resize(+0.1));

  lib_util.bind("Shift+t", lib_subtitle.move_up());
  lib_util.bind("t", lib_subtitle.move_down());

  lib_util.bind("Shift+b", lib_subtitle.navigate_prev());
  lib_util.bind("b", lib_subtitle.navigate_next());

  lib_util.bind("v", lib_subtitle.toggle("primary"));
  lib_util.bind("Shift+v", lib_subtitle.toggle("secondary"));
  lib_util.bind("Alt+v", lib_subtitle.toggle("both"));
}

function _audio() {
  lib_util.bind("9", lib_audio.volume(-1));
  lib_util.bind("(", lib_audio.volume(-7));
  lib_util.bind("0", lib_audio.volume(+1));
  lib_util.bind(")", lib_audio.volume(+7));

  lib_util.bind("m", lib_audio.mute);

  lib_util.bind("SHARP", lib_audio.navigate);
}

function _playback() {
  lib_util.bind("SPACE", lib_playback.playpause);

  lib_util.bind("<", lib_playback.navigate_playlist(false));
  lib_util.bind(">", lib_playback.navigate_playlist(true));
  lib_util.bind("k", lib_report.report_playlist);
  lib_util.bind("Shift+k", function () {
    lib_util.print_prop_object("playlist");
  });

  lib_util.bind("j", lib_report.tracking.print_pretty);
  lib_util.bind("Shift+j", lib_report.tracking.print_raw);

  lib_util.bind("l", lib_playback.loop_ab);
  lib_util.bind("L", lib_playback.loop_files);

  lib_util.bind(",", lib_playback.navigate_file(-1, "frame"));
  lib_util.bind(".", lib_playback.navigate_file(+1, "frame"));

  lib_util.bind("LEFT", lib_playback.navigate_file(-3));
  lib_util.bind("RIGHT", lib_playback.navigate_file(+3));
  lib_util.bind("Shift+LEFT", lib_playback.navigate_file(-1));
  lib_util.bind("Shift+RIGHT", lib_playback.navigate_file(+1));
  lib_util.bind("Ctrl+LEFT", lib_playback.navigate_file(-7));
  lib_util.bind("Ctrl+RIGHT", lib_playback.navigate_file(+7));
  lib_util.bind("PGUP", lib_playback.navigate_file(-1, "chapter"));
  lib_util.bind("PGDWN", lib_playback.navigate_file(+1, "chapter"));

  lib_util.bind("[", lib_playback.adjust_speed(-0.1));
  lib_util.bind("]", lib_playback.adjust_speed(+0.1));
  lib_util.bind("BS", lib_playback.adjust_speed());
}

function _misc() {
  lib_util.bind("i", lib_misc.osc.toggle);
  lib_util.bind("I", lib_misc.stats.toggle);
  lib_util.bind("`", lib_misc.console.enable);
  lib_util.bind("Shift+s", lib_misc.screenshot);

  function title() {
    var title = "";

    var server = lib_util.get_prop_string("input-ipc-server");
    if (server) {
      // show only filename of socket
      title = title.concat("[" + server.split("/").slice(-1).toString() + "] ");
    }

    title = title.concat("${path}");
    lib_util.set_prop_string("title", title);
  }

  function savepos() {
    lib_misc.record.save_filename_only();
    lib_misc.record.append_targets("secondary-sub-delay");

    lib_util.bind("Ctrl+s", lib_misc.record.save);
    lib_util.bind("Ctrl+Shift+s", lib_misc.record.toggle);
    lib_util.bind("Ctrl+q", lib_misc.record.save_quit);
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
