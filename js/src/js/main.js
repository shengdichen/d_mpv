var component = require("./component");

var conf = {};
conf.bind = function () {
  component.video.config();
  component.video.bind();

  component.audio.config();
  component.audio.bind();

  component.subtitle.bind();

  component.playback.savepos();
  component.playback.title();
  component.playback.bind();

  component.misc();
};

module.exports = {
  conf: conf,
};
