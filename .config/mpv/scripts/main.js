var util = require('./util')

function Main () {
  this.rebind = function () {
    mp.add_forced_key_binding('o', function () { util.osc.toggle() })
  }
}
var main = new Main()
main.rebind()
