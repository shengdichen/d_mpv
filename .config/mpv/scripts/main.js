var util = require('./util')

function Main () {
  this.bind = function () {
    util.video.bind()
    util.audio.bind()
    util.subtitle.bind()
    util.playback.bind()
    util.osc.bind()
  }
}
var main = new Main()
main.bind()
