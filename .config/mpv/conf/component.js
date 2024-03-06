var util = require('./util')
var util_misc = util.util_misc
var util_mpv = util.util_mpv
var report_file = util.report_file

var video = new function () {
  this.navigate = function () {
    util_mpv.cycle('video')
    report_file.report_category_video()
  }

  function _position (dimension) {
    return util_misc.prepend_sign(
      util_misc.truncate_after_decimal(
        util_mpv.get_prop('video-pan-' + dimension, type = 'num')
      )
    )
  }
  this.reposition = function (incr, dimension) {
    return function () {
      util_mpv.run(['add', 'video-pan-' + dimension, incr])
      util_mpv.print_osd(
        'video/pos> (' + _position('x') + ', ' + _position('y') + ')')
    }
  }

  function _size () {
    return util_misc.prepend_sign(
      util_misc.truncate_after_decimal(
        util_mpv.get_prop('video-zoom', type = 'num')
      )
    )
  }
  this.resize = function (incr) {
    return function () {
      util_mpv.run(['add', 'video-zoom', incr])
      util_mpv.print_osd(
        'video/size> ' + _size())
    }
  }

  this.deinterlace = function (incr) {
    return function () {
      util_mpv.cycle('deinterlace')
      util_mpv.print_osd(
        'video/deinterlace> ' + util_mpv.get_prop('deinterlace'))
    }
  }

  this.hwdec = function (incr) {
    util_mpv.cycle('hwdec', ['auto', 'no'])
    util_mpv.print_osd(
      'video/hwdec> ' + util_mpv.get_prop('hwdec-current') + ' [' + util_mpv.get_prop('hwdec') + ']')
  }

  this.bind = function () {
    mp.add_key_binding('SPACE', function () { util_mpv.cycle('pause') })
    mp.add_key_binding('f', function () { util_mpv.cycle('fullscreen') })
    mp.add_key_binding('Ctrl+r', function () {
      util_mpv.cycle('video-rotate', [90, 180, 270, 0])
    })

    mp.add_key_binding('_', this.navigate)

    mp.add_key_binding('Alt+LEFT', this.reposition(-0.1, 'x'))
    mp.add_key_binding('Alt+RIGHT', this.reposition(+0.1, 'x'))
    mp.add_key_binding('Alt+UP', this.reposition(-0.1, 'y'))
    mp.add_key_binding('Alt+DOWN', this.reposition(+0.1, 'y'))

    mp.add_key_binding('Alt+-', this.resize(-0.1))
    mp.add_key_binding('Alt++', this.resize(+0.1))

    mp.add_key_binding('d', this.deinterlace(-0.1))
    mp.add_key_binding('Ctrl+h', this.hwdec)
  }
}()

var audio = new function () {
  this.volume = function (incr) {
    return function () {
      var vol_prev = util_mpv.get_prop('volume', type = 'num')
      var vol_next = vol_prev + incr
      util_mpv.set_prop('volume', vol_next, type = 'num')
      util_mpv.print_osd(
        'volume> ' + vol_next + ' [' + vol_prev + _format_volume_incr(incr) + ']'
      )
    }
  }

  function _format_volume_incr (incr) {
    if (incr === 1) { return '++' }
    if (incr === -1) { return '--' }
    return util_misc.prepend_sign(incr)
  }

  this.mute = function () {
    util_mpv.cycle('mute')
    util_mpv.print_osd('mute> ' + (util_mpv.get_prop('mute', type = 'bool') ? 'T' : 'F'))
  }

  this.navigate = function () {
    util_mpv.cycle('audio')
    report_file.report_category_audio()
  }

  this.bind = function () {
    mp.add_key_binding('9', this.volume(-1))
    mp.add_key_binding('(', this.volume(-7))
    mp.add_key_binding('0', this.volume(+1))
    mp.add_key_binding(')', this.volume(+7))

    mp.add_key_binding('m', this.mute)

    mp.add_key_binding('SHARP', this.navigate)
  }
}()

var subtitle = new function () {
  function _delay (target) {
    if (target === 'primary') {
      target = 'sub-delay'
    } else if (target === 'secondary') {
      target = 'secondary-sub-delay'
    }
    return util_misc.truncate_after_decimal(util_mpv.get_prop(target, type = 'num'))
  }
  function _retime_primary (incr) {
    util_mpv.run(['add', 'sub-delay', incr])
    util_mpv.print_osd(
      'subtitle/delay-primary> ' + _delay('primary')
    )
  }
  function _retime_secondary (incr) {
    util_mpv.run(['add', 'secondary-sub-delay', incr])
    util_mpv.print_osd(
      'subtitle/delay-secondary> ' + _delay('secondary')
    )
  }
  this.retime = function (incr, target) {
    return function () {
      if (target === 'primary') {
        _retime_primary(incr)
      } else if (target === 'secondary') {
        _retime_secondary(incr)
      } else if (target === 'both') {
        _retime_primary(incr)
        _retime_secondary(incr)
        util_mpv.print_osd(
          'subtitle/delay> (primary, secondary): ' + _delay('primary') + ', ' + _delay('secondary')
        )
      }
    }
  }

  this.resize = function (incr) {
    return function () {
      util_mpv.run(['add', 'sub-scale', incr])
      util_mpv.print_osd(
        'subtitle/scale> ' + util_misc.truncate_after_decimal(util_mpv.get_prop('sub-scale', type = 'num'))
      )
    }
  }

  this.reposition = function (incr) {
    return function () {
      util_mpv.run(['add', 'sub-pos', incr])
      util_mpv.print_osd(
        'subtitle/pos> ' + util_mpv.get_prop('sub-pos', type = 'num')
      )
    }
  }

  this.navigate = function (positive_dir) {
    return function () {
      if (positive_dir) {
        util_mpv.run(['cycle', 'sub', 'up'])
      } else {
        util_mpv.run(['cycle', 'sub', 'down'])
      }
      report_file.report_category_sub()
    }
  }

  this.bind = function () {
    mp.add_key_binding('z', this.retime(+0.1, target = 'primary'))
    mp.add_key_binding('x', this.retime(-0.1, target = 'primary'))
    mp.add_key_binding('Z', this.retime(+0.1, target = 'secondary'))
    mp.add_key_binding('X', this.retime(-0.1, target = 'secondary'))

    mp.add_key_binding('Shift+f', this.resize(-0.1))
    mp.add_key_binding('Shift+g', this.resize(+0.1))

    mp.add_key_binding('r', this.reposition(-1))
    mp.add_key_binding('t', this.reposition(+1))

    mp.add_key_binding('j', this.navigate(true))
    mp.add_key_binding('Shift+j', this.navigate(false))
  }
}()

var playback = new function () {
  this.navigate_playlist = function (positive_dir) {
    return function () {
      if (positive_dir) {
        util_mpv.run(['playlist-next'])
      } else {
        util_mpv.run(['playlist-prev'])
      }
      report_file.report_playlist()
    }
  }

  this.navigate_file = function (incr, mode) {
    return function () {
      if (mode === 'chapter') {
        util_mpv.run(['add', 'chapter', incr])
        report_file.report_chapter()
      } else {
        util_mpv.run(['seek', incr, 'relative+exact'])
      }
    }
  }

  this.adjust_speed = function (incr) {
    return function () {
      if (!incr) {
        util_mpv.run(['set', 'speed', 1.0])
        util_mpv.print_osd('speed> 1.0')
      } else {
        util_mpv.run(['add', 'speed', incr])
        util_mpv.print_osd('speed> ' + util_misc.truncate_after_decimal(util_mpv.get_prop('speed', type = 'num')))
      }
    }
  }

  this.loop_files = function () {
    util_mpv.cycle('loop-file', ['inf', 'no'])
    util_mpv.print_prop('loop-file')
  }

  function _loop_ab_bound (mode) {
    var bound = util_mpv.get_prop('ab-loop-' + mode)
    if (bound === 'no') { return undefined }
    return util_misc.truncate_after_decimal(bound, 3)
  }

  this.loop_ab = function () {
    util_mpv.run(['ab-loop'])

    var msg
    var bound_a = _loop_ab_bound('a')
    var bound_b = _loop_ab_bound('b')

    if (bound_a) {
      if (bound_b) {
        msg = bound_a + ' <--> ' + bound_b
      } else {
        msg = bound_a + ' ->?'
      }
    } else {
      msg = '?'
    }
    util_mpv.print_osd('loop-ab> ' + msg)
  }

  this.bind = function () {
    mp.add_key_binding('F8', report_file.report_playlist)
    mp.add_key_binding('F9', function () { util_mpv.print_prop('playlist', type = 'raw') })
    mp.add_key_binding('k', report_file.report_categories)
    mp.add_key_binding('K', function () { util_mpv.print_prop('track-list', type = 'raw') })
    mp.add_key_binding('<', this.navigate_playlist(positive_dir = false))
    mp.add_key_binding('>', this.navigate_playlist(positive_dir = true))

    mp.add_key_binding('l', this.loop_ab)
    mp.add_key_binding('L', this.loop_files)

    mp.add_key_binding('LEFT', this.navigate_file(-3))
    mp.add_key_binding('RIGHT', this.navigate_file(+3))
    mp.add_key_binding('UP', this.navigate_file(-7))
    mp.add_key_binding('DOWN', this.navigate_file(+7))
    mp.add_key_binding('PGUP', this.navigate_file(-1, mode = 'chapter'))
    mp.add_key_binding('PGDWN', this.navigate_file(+1, mode = 'chapter'))

    mp.add_key_binding('[', this.adjust_speed(-0.1))
    mp.add_key_binding(']', this.adjust_speed(+0.1))
    mp.add_key_binding('BS', this.adjust_speed())

    mp.add_key_binding('I', function () {
      // REF:
      // https://github.com/Argon-/mpv-stats/blob/master/stats.lua
      // https://github.com/mpv-player/mpv/blob/master/player/lua/stats.lua
      util_mpv.run(['script-binding', 'stats/display-stats-toggle'])
    })
    mp.add_key_binding('`', function () {
      // REF:
      // https://github.com/mpv-player/mpv/blob/master/player/lua/console.lua
      util_mpv.run(['script-binding', 'console/enable'])
    })
  }
}()

var osc = new function () {
  var _this = this

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
    util_mpv.run(_this._frags_disable)
  }

  this.enable = function () {
    util_mpv.run(_this._frags_enable)
  }

  this.toggle = function () {
    if (_this._is_visible) { _this.disable() } else { _this.enable() }
    _this._is_visible = !_this._is_visible
  }

  this.bind = function () {
    mp.add_forced_key_binding('o', _this.toggle)
  }
}()

module.exports.video = video
module.exports.audio = audio
module.exports.subtitle = subtitle
module.exports.playback = playback
module.exports.osc = osc
