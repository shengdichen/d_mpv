var lib_util = require("./lib/util").export;
var lib_audio = require("./lib/audio").export;

function _audio() {
  lib_util.bind("9", lib_audio.volume(-1));
  lib_util.bind("(", lib_audio.volume(-7));
  lib_util.bind("0", lib_audio.volume(+1));
  lib_util.bind(")", lib_audio.volume(+7));

  lib_util.bind("m", lib_audio.mute);

  lib_util.bind("SHARP", lib_audio.navigate);
}

function config() {
  require("./lib/video").export.config();
  require("./lib/subtitle").export.config();
  _audio();
  require("./lib/playback").export.config();
  require("./lib/misc").export.config();
}

module.exports = {
  export: config,
};
