var component = require('./component')

module.exports.conf = new function () {
  this.bind = function () {
    component.video.bind()
    component.audio.bind()
    component.subtitle.bind()

    component.playback.savepos()
    component.playback.bind()

    component.osc.bind()
  }
}()
