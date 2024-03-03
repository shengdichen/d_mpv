var util = require('./util')

function Main () {
  this.rebind = function () {
    mp.add_forced_key_binding('o', function () { util.osc.toggle() })

    util.video.bind()
    util.audio.bind()
    util.playback.bind()
  }
}
var main = new Main()
main.rebind()
