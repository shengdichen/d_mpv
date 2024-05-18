function config() {
  require("./lib/video").export.config();
  require("./lib/subtitle").export.config();
  require("./lib/audio").export.config();
  require("./lib/playback").export.config();
  require("./lib/misc").export.config();
}

module.exports = {
  export: config,
};
