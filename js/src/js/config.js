function config() {
  require("./lib/video").export.config();
  require("./lib/subtitle").export.config();
  require("./lib/audio").export.config();
  require("./lib/playback").export.config();
  require("./lib/osc").export.config();
}

module.exports = {
  export: config,
};
