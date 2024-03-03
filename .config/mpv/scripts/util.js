function MiscUtil () {
  this.format_integer = function (num) {
    return (num < 0 ? '' : '+') + num
  }
}
var misc_util = new MiscUtil()
module.exports.misc_util = misc_util

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

  this.get_prop = function (prop, type, def) {
    if (type === 'bool') {
      return mp.get_property_bool(prop, def)
    }
    if (type === 'num') {
      return mp.get_property_number(prop, def)
    }
    return mp.get_property(prop)
  }

  this.set_prop = function (prop, val, type) {
    if (type === 'bool') {
      return mp.set_property_bool(prop, val)
    }
    if (type === 'num') {
      return mp.set_property_number(prop, val)
    }
    return mp.set_property(prop)
  }

  this.cycle = function (item, values) {
    if (!values) {
      this.run(['cycle', item])
    } else {
      this.run(['cycle-values', item].concat(values))
    }
  }

  this.print_prop = function (prop, type, def) {
    this.print_osd(this.get_prop(prop, type, def))
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

function Audio () {
  this.volume = function (incr) {
    return function () {
      var vol_prev = mpv_util.get_prop('volume', type = 'num')
      var vol_next = vol_prev + incr
      mpv_util.set_prop('volume', vol_next, type = 'num')
      mpv_util.print_osd(
        'volume> ' + vol_next + ' [' + vol_prev + _format_volume_incr(incr) + ']'
      )
    }
  }

  function _format_volume_incr (incr) {
    if (incr === 1) { return '++' }
    if (incr === -1) { return '--' }
    return misc_util.format_integer(incr)
  }

  this.mute = function () {
    mpv_util.cycle('mute')
    mpv_util.print_osd('mute> ' + (mpv_util.get_prop('mute', type = 'bool') ? 'T' : 'F'))
  }

  this.bind = function () {
    mp.add_key_binding('9', this.volume(-1))
    mp.add_key_binding('(', this.volume(-7))
    mp.add_key_binding('0', this.volume(+1))
    mp.add_key_binding(')', this.volume(+7))

    mp.add_key_binding('m', this.mute)

    mp.add_key_binding('SHARP', function () { mpv_util.cycle('audio') })
  }
}
module.exports.audio = new Audio()

function Video () {
  this.bind = function () {
    mp.add_key_binding('SPACE', function () { mpv_util.cycle('pause') })
    mp.add_key_binding('f', function () { mpv_util.cycle('fullscreen') })
    mp.add_key_binding('_', function () { mpv_util.cycle('video') })
    mp.add_key_binding('Ctrl+r', function () {
      mpv_util.cycle('video-rotate', [90, 180, 270, 0])
    })
  }
}
module.exports.video = new Video()

function Playback () {
  this.navigate_playlist = function (positive_dir) {
    return function () {
      if (positive_dir) {
        mpv_util.run(['playlist-next'])
      } else {
        mpv_util.run(['playlist-prev'])
      }
    }
  }

  this.loop_files = function () {
    mpv_util.cycle('loop-file', ['inf', 'no'])
    mpv_util.print_prop('loop-file')
  }

  this.bind = function () {
    mp.add_key_binding('<', this.navigate_playlist(positive_dir = false))
    mp.add_key_binding('>', this.navigate_playlist(positive_dir = true))

    // mp.add_key_binding('l', function () { mpv_util.run(['ab-loop']) })
    mp.add_key_binding('L', this.loop_files)
  }
}
module.exports.playback = new Playback()
