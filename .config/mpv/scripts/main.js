var util = require('../conf/util')

function Main () {
  this.conf = function () {
    util.video.bind()
    util.audio.bind()
    util.subtitle.bind()
    util.playback.bind()
    util.osc.bind()
  }
}
var main = new Main()
main.conf()
