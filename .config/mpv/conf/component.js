var util = require('./util')
var util_misc = util.util_misc
var util_mpv = util.util_mpv
var report = util.report

var video = new function () {
  this.navigate = function () {
    util_mpv.cycle('video')
    report.report_category_video()
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
    util_mpv.cycle('hwdec', ['auto', 'nvdec', 'nvdec-copy', 'no'])
    util_mpv.print_osd(
      'video/hwdec> ' + util_mpv.get_prop('hwdec-current') + ' [' + util_mpv.get_prop('hwdec') + ']')
  }

  this.bind = function () {
    util_mpv.bind('SPACE', function () { util_mpv.cycle('pause') })
    util_mpv.bind('f', function () { util_mpv.cycle('fullscreen') })
    util_mpv.bind('Ctrl+r', function () {
      util_mpv.cycle('video-rotate', [90, 180, 270, 0])
    })

    util_mpv.bind('_', this.navigate)

    util_mpv.bind('Alt+LEFT', this.reposition(-0.1, 'x'))
    util_mpv.bind('Alt+RIGHT', this.reposition(+0.1, 'x'))
    util_mpv.bind('Alt+UP', this.reposition(-0.1, 'y'))
    util_mpv.bind('Alt+DOWN', this.reposition(+0.1, 'y'))

    util_mpv.bind('Alt+-', this.resize(-0.1))
    util_mpv.bind('Alt++', this.resize(+0.1))

    util_mpv.bind('d', this.deinterlace(-0.1))
    util_mpv.bind('Ctrl+h', this.hwdec)
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
    report.report_category_audio()
  }

  this.bind = function () {
    util_mpv.bind('9', this.volume(-1))
    util_mpv.bind('(', this.volume(-7))
    util_mpv.bind('0', this.volume(+1))
    util_mpv.bind(')', this.volume(+7))

    util_mpv.bind('m', this.mute)

    util_mpv.bind('SHARP', this.navigate)
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
      report.report_category_sub()
    }
  }

  this.toggle = function (target) {
    return function () {
      if (target === 'both') {
        util_mpv.cycle('sub-visibility')
        var visible_primary = util_mpv.get_prop('sub-visibility')
        util_mpv.set_prop('secondary-sub-visibility', !visible_primary)
        util_mpv.print_osd(
          'subtitle/visibility>' + visible_primary ? 'primary' : 'secondary'
        )
      } else {
        var opt = target === 'primary' ? 'sub-visibility' : 'secondary-sub-visibility'
        util_mpv.cycle(opt)
        util_mpv.print_osd(
          'subtitle/visibility-' + target + '> ' + (util_mpv.get_prop(opt) ? 'T' : 'F')
        )
      }
    }
  }

  this.bind = function () {
    util_mpv.bind('z', this.retime(+0.1, target = 'primary'))
    util_mpv.bind('x', this.retime(-0.1, target = 'primary'))
    util_mpv.bind('Z', this.retime(+0.1, target = 'secondary'))
    util_mpv.bind('X', this.retime(-0.1, target = 'secondary'))

    util_mpv.bind('Shift+g', this.resize(-0.1))
    util_mpv.bind('g', this.resize(+0.1))

    util_mpv.bind('Shift+t', this.reposition(-1))
    util_mpv.bind('t', this.reposition(+1))

    util_mpv.bind('b', this.navigate(true))
    util_mpv.bind('Shift+b', this.navigate(false))

    util_mpv.bind('v', this.toggle('primary'))
    util_mpv.bind('Shift+v', this.toggle('secondary'))
    util_mpv.bind('Alt+v', this.toggle('both'))
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
      report.report_playlist()
    }
  }

  this.navigate_file = function (incr, mode) {
    return function () {
      if (mode === 'chapter') {
        util_mpv.run(['add', 'chapter', incr])
        report.report_chapter()
      } else if (mode === 'frame') {
        if (incr > 0) { util_mpv.run(['frame-step']) } else { util_mpv.run(['frame-back-step']) }
      } else {
        util_mpv.run(['seek', incr, 'relative+exact'])
      }

      var current = util_mpv.get_prop('playback-time', type = 'raw')
      var duration = util_mpv.get_prop('duration', type = 'raw')
      util_mpv.print_osd('time> ' + current + '/' + duration)
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

  this.screenshot = function () {
    util_mpv.run(['screenshot'])
  }

  this.savepos = function () {
    util_mpv.set_prop('write-filename-in-watch-later-config', true)
    util_mpv.set_prop('ignore-path-in-watch-later-config', true)

    util_mpv.set_prop('watch-later-options',
      [util_mpv.get_prop('watch-later-options', type = 'string'), 'secondary-sub-delay'].join(',')
    )

    util_mpv.bind('Ctrl+s',
      function () {
        util_mpv.cycle('save-position-on-quit')
        util_mpv.print_osd('savepos> ' + (util_mpv.get_prop('save-position-on-quit') ? 'T' : 'F'))
      }
    )
    util_mpv.bind('Ctrl+q',
      function () { util_mpv.run(['quit-watch-later']) }
    )
  }

  this.title = function () {
    var title = ''

    var server = util_mpv.get_prop('input-ipc-server')
    if (server) {
      // show only filename of socket
      title = title.concat('[' + server.split('/').slice(-1).toString() + '] ')
    }

    title = title.concat('${path}')
    util_mpv.set_prop('title', title)
  }

  this.bind = function () {
    util_mpv.bind('<', this.navigate_playlist(positive_dir = false))
    util_mpv.bind('>', this.navigate_playlist(positive_dir = true))
    util_mpv.bind('k', report.report_playlist)
    util_mpv.bind('Shift+k', function () { util_mpv.print_prop('playlist', type = 'string') })

    util_mpv.bind('j', report.report_categories)
    util_mpv.bind('Shift+j', function () { util_mpv.print_prop('track-list', type = 'string') })

    util_mpv.bind('l', this.loop_ab)
    util_mpv.bind('L', this.loop_files)

    util_mpv.bind(',', this.navigate_file(-1, mode = 'frame'))
    util_mpv.bind('.', this.navigate_file(+1, mode = 'frame'))

    util_mpv.bind('LEFT', this.navigate_file(-3))
    util_mpv.bind('RIGHT', this.navigate_file(+3))
    util_mpv.bind('UP', this.navigate_file(-7))
    util_mpv.bind('DOWN', this.navigate_file(+7))
    util_mpv.bind('PGUP', this.navigate_file(-1, mode = 'chapter'))
    util_mpv.bind('PGDWN', this.navigate_file(+1, mode = 'chapter'))

    util_mpv.bind('Shift+s', this.screenshot)

    util_mpv.bind('[', this.adjust_speed(-0.1))
    util_mpv.bind(']', this.adjust_speed(+0.1))
    util_mpv.bind('BS', this.adjust_speed())

    util_mpv.bind('I', function () {
      // REF:
      // https://github.com/Argon-/mpv-stats/blob/master/stats.lua
      // https://github.com/mpv-player/mpv/blob/master/player/lua/stats.lua
      util_mpv.run_script_bind('stats', 'display-stats-toggle')
    })
    util_mpv.bind('`', function () {
      // REF:
      // https://github.com/mpv-player/mpv/blob/master/player/lua/console.lua
      util_mpv.run_script_bind('console', 'enable')
    })
  }
}()

var osc = new function () {
  var _this = this

  function _is_visible_by_default () {
    var opt = { visibility: 'never' }
    mp.options.read_options(opt, 'osc')
    return opt.visibility !== 'never'
  }
  this._is_visible = _is_visible_by_default()

  // REF:
  //    https://github.com/mpv-player/mpv/blob/master/player/lua/osc.lua
  var fn = 'osc-visibility'
  // NOTE:
  //    pass second arg |false| to disable osd-output (prepending 'no-osd' has no use)
  this.disable = function () { util_mpv.run_script_fn(fn, ['never', false]) }
  this.enable = function () { util_mpv.run_script_fn(fn, ['always', false]) }

  this.toggle = function () {
    if (_this._is_visible) { _this.disable() } else { _this.enable() }
    _this._is_visible = !_this._is_visible
  }

  this.bind = function () {
    mp.add_forced_key_binding('i', _this.toggle)
  }
}()

module.exports.video = video
module.exports.audio = audio
module.exports.subtitle = subtitle
module.exports.playback = playback
module.exports.osc = osc
