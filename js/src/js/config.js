var lib_util = require("./lib/util").export;
var lib_video = require("./lib/video").export;
var lib_subtitle = require("./lib/subtitle").export;
var lib_audio = require("./lib/audio").export;

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

function config() {
  _video();
  _subtitle();
  _audio();
  require("./lib/playback").export.config();
  require("./lib/misc").export.config();
}

module.exports = {
  export: config,
};
