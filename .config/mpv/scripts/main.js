var component = require('../conf/component')

function Main () {
  this.conf = function () {
    component.video.bind()
    component.audio.bind()
    component.subtitle.bind()
    component.playback.bind()
    component.osc.bind()
  }
}
var main = new Main()
main.conf()
