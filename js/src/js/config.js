var lib_util = require("./lib/util").export;
var lib_video = require("./lib/video").export;
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
  require("./lib/subtitle").export.config();
  _audio();
  require("./lib/playback").export.config();
  require("./lib/misc").export.config();
}

module.exports = {
  export: config,
};
