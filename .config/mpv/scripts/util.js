function MpvUtil () {
  this.print_osd = function (text, duration) {
    if (!duration) {
      duration = 0.7
    }
    mp.osd_message(text, duration)
  }

  this.run = function (fragments) {
    mp.commandv.apply(null, fragments)
  }
}
var mpv_util = new MpvUtil()
module.exports.mpv_util = mpv_util

function Osc () {
  function _is_visible_by_default () {
    var opt = { visibility: 'never' }
    mp.options.read_options(opt, 'osc')
    return opt.visibility != 'never'
  }
  this._is_visible = _is_visible_by_default()

  var frags_base = ['no-osd', 'script-message', 'osc-visibility']
  this._frags_disable = frags_base.concat('never')
  this._frags_enable = frags_base.concat('always')

  this.disable = function () {
    mpv_util.run(this._frags_disable)
  }

  this.enable = function () {
    mpv_util.run(this._frags_enable)
  }

  this.toggle = function () {
    if (this._is_visible) {
      this.disable()
    } else {
      this.enable()
    }
    this._is_visible = !this._is_visible
  }
}
module.exports.osc = new Osc()
