var conf = require('../conf/main').conf

function Main() {
  this.conf = function () {
    conf.bind()
  }
}
var main = new Main()
main.conf()
