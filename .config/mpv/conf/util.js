function UtilMisc () {
  var _this = this

  this.prepend_sign = function (num) {
    return (num < 0 ? '' : '+') + num
  }

  this.pad_integer_to = function (num, reference) {
    return _this.pad_integer(num, _this.len_integer(reference))
  }

  this.pad_integer = function (num, len) {
    num = num.toString()
    while (num.length < len) { num = '0' + num }
    return num
  }

  this.len_integer = function (num) {
    return num.toString().length
  }

  this.format_float = function (num, n_digits_after_decimal) {
    if (!n_digits_after_decimal) {
      n_digits_after_decimal = 2
    }
    return num.toFixed(n_digits_after_decimal)
  }
}
var misc_util = new UtilMisc()

function UtilMpv () {
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
    if (type === 'raw') {
      return mp.get_property(prop, def)
    }
    return mp.get_property_native(prop, def)
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
var mpv_util = new UtilMpv()

function ReportFile () {
  this.report_categories = function () {
    var categories = _categorize()
    var vids = categories[0]
    var auds = categories[1]
    var subs = categories[2]
    var n_tracks_global = categories[3]

    var strings = []
    strings.push(_format_category_video(vids, n_tracks_global))
    strings.push(_format_category_audio(auds, n_tracks_global))
    strings.push(_format_category_sub(subs, n_tracks_global))
    var separator = '\n' + Array(37).join('-') + '\n'
    mpv_util.print_osd(strings.join(separator))
  }

  this.report_category_video = function () {
    mpv_util.print_osd(_format_category_video(_categorize_one('video')))
  }

  this.report_category_audio = function () {
    mpv_util.print_osd(_format_category_audio(_categorize_one('audio')))
  }

  this.report_category_sub = function () {
    mpv_util.print_osd(_format_category_sub(_categorize_one('sub')))
  }

  function _categorize () {
    var tracks = mpv_util.get_prop('track-list')
    var vids = []
    var auds = []
    var subs = []
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i]
      if (t.type === 'video') {
        vids.push(t)
      } else if (t.type === 'audio') {
        auds.push(t)
      } else if (t.type === 'sub') {
        subs.push(t)
      }
    }
    return [vids, auds, subs, tracks.length]
  }

  function _categorize_one (type) {
    var tracks = mpv_util.get_prop('track-list')
    var category = []
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].type === type) { category.push(tracks[i]) }
    }
    return category
  }

  function _format_category_video (tracks, n_tracks_global) {
    var strings = []
    strings.push('vid')
    if (!tracks.length) { return _format_tracks_empty(strings) }

    var n_tracks = tracks.length
    for (var i = 0; i < n_tracks; i++) {
      var t = tracks[i]
      var str = _format_track_selected(t.selected)
      if (n_tracks_global) { str = str.concat(_format_id_global(t, n_tracks_global)) }
      str = str.concat(_format_id_in_category(t, n_tracks))
      str = str.concat(t.codec)
      var fps = t['demux-fps']
      if (fps) {
        if (fps === 1) {
          str = str.concat('[static]')
        } else {
          if (fps % 1 !== 0) {
            fps = misc_util.format_float(fps, n_digits_after_decimal = 3)
          }
          str = str.concat('@' + fps + 'fps')
        }
      }
      if (t['demux-w'] && t['demux-h']) {
        str = str.concat(' ' + t['demux-w'] + 'x' + t['demux-h'])
      }
      strings.push(str)
    }
    return strings.join('\n')
  }

  function _format_category_audio (tracks, n_tracks_global) {
    var strings = []
    strings.push('aud')
    if (!tracks.length) { return _format_tracks_empty(strings) }

    var n_tracks = tracks.length
    for (var i = 0; i < n_tracks; i++) {
      var t = tracks[i]
      var str = _format_track_selected(t.selected)
      if (n_tracks_global) { str = str.concat(_format_id_global(t, n_tracks_global)) }
      str = str.concat(_format_id_in_category(t, n_tracks))
      str = str.concat(t.codec + '[x' + t['demux-channel-count'] + ']')
      if (t.lang) { str = str.concat(' ' + t.lang) }
      strings.push(str)
    }
    return strings.join('\n')
  }

  function _format_category_sub (tracks, n_tracks_global) {
    var strings = []
    strings.push('sub')
    if (!tracks.length) { return _format_tracks_empty(strings) }

    var n_tracks = tracks.length
    for (var i = 0; i < n_tracks; i++) {
      var t = tracks[i]
      var str = ''
      if (t.selected) {
        // REF:
        //  https://mpv.io/manual/master/#command-interface-track-list/n/main-selection
        if (t['main-selection']) {
          str = str.concat(' >> ') // secondary subtitle
        } else {
          str = str.concat('  > ') // primary subtitle
        }
      } else {
        str = str.concat('    ')
      }
      if (n_tracks_global) { str = str.concat(_format_id_global(t, n_tracks_global)) }
      str = str.concat(_format_id_in_category(t, n_tracks))
      if (t.lang) { str = str.concat(t.lang) }
      strings.push(str)
    }
    return strings.join('\n')
  }

  this.report_chapter = function () {
    var strings = []
    strings.push('chapter')
    var chapters = mpv_util.get_prop('chapter-list')
    var n_chapters = chapters.length
    if (!n_chapters) {
      mpv_util.print_osd(_format_tracks_empty(strings))
    } else {
      for (var i = 0; i < n_chapters; i++) {
        var c = chapters[i]
        var str = _format_track_selected(mpv_util.get_prop('chapter') === i)
        str = str.concat((i + 1) + '/' + n_chapters + ')')
        if (c.title) { str = str.concat(" '" + c.title + "'") }
        strings.push(str)
      }
      mpv_util.print_osd(strings.join('\n'))
    }
  }

  this.report_playlist = function () {
    var strings = []
    strings.push('playlist')
    var files = mpv_util.get_prop('playlist')
    var n_files = files.length
    if (!n_files) {
      mpv_util.print_osd(_format_tracks_empty(strings))
    } else {
      for (var i = 0; i < n_files; i++) {
        var f = files[i]
        var str = _format_track_selected(f.playing)
        str = str.concat(misc_util.pad_integer_to(f.id, n_files) + '/' + n_files + ') ' + f.filename)
        strings.push(str)
      }
      mpv_util.print_osd(strings.join('\n'))
    }
  }

  function _format_tracks_empty (strings) {
    strings.push('  ?')
    return strings.join('\n')
  }

  function _format_track_selected (test) {
    return test ? '  > ' : '    '
  }

  function _format_id_in_category (track, n_tracks) {
    var str = ''
    str = str.concat(misc_util.pad_integer_to(track.id, n_tracks))
    str = str.concat('/' + n_tracks + ') ')
    return str
  }

  function _format_id_global (track, n_tracks_global) {
    var str = ''
    if (track['src-id']) {
      str = str.concat('[' + misc_util.pad_integer_to(track['src-id'], n_tracks_global) + '] ')
    }
    return str
  }
}
var report_file = new ReportFile()

function Osc () {
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
    mpv_util.run(_this._frags_disable)
  }

  this.enable = function () {
    mpv_util.run(_this._frags_enable)
  }

  this.toggle = function () {
    if (_this._is_visible) { _this.disable() } else { _this.enable() }
    _this._is_visible = !_this._is_visible
  }

  this.bind = function () {
    mp.add_forced_key_binding('o', _this.toggle)
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
    return misc_util.prepend_sign(incr)
  }

  this.mute = function () {
    mpv_util.cycle('mute')
    mpv_util.print_osd('mute> ' + (mpv_util.get_prop('mute', type = 'bool') ? 'T' : 'F'))
  }

  this.navigate = function () {
    mpv_util.cycle('audio')
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
}
module.exports.audio = new Audio()

function Video () {
  this.navigate = function () {
    mpv_util.cycle('video')
    report_file.report_category_video()
  }

  function _position (dimension) {
    return misc_util.prepend_sign(
      misc_util.format_float(
        mpv_util.get_prop('video-pan-' + dimension, type = 'num')
      )
    )
  }
  this.reposition = function (incr, dimension) {
    return function () {
      mpv_util.run(['add', 'video-pan-' + dimension, incr])
      mpv_util.print_osd(
        'video/pos> (' + _position('x') + ', ' + _position('y') + ')')
    }
  }

  function _size () {
    return misc_util.prepend_sign(
      misc_util.format_float(
        mpv_util.get_prop('video-zoom', type = 'num')
      )
    )
  }
  this.resize = function (incr) {
    return function () {
      mpv_util.run(['add', 'video-zoom', incr])
      mpv_util.print_osd(
        'video/size> ' + _size())
    }
  }

  this.deinterlace = function (incr) {
    return function () {
      mpv_util.cycle('deinterlace')
      mpv_util.print_osd(
        'video/deinterlace> ' + mpv_util.get_prop('deinterlace'))
    }
  }

  this.hwdec = function (incr) {
    mpv_util.cycle('hwdec', ['auto', 'no'])
    mpv_util.print_osd(
      'video/hwdec> ' + mpv_util.get_prop('hwdec-current') + ' [' + mpv_util.get_prop('hwdec') + ']')
  }

  this.bind = function () {
    mp.add_key_binding('SPACE', function () { mpv_util.cycle('pause') })
    mp.add_key_binding('f', function () { mpv_util.cycle('fullscreen') })
    mp.add_key_binding('Ctrl+r', function () {
      mpv_util.cycle('video-rotate', [90, 180, 270, 0])
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
}
module.exports.video = new Video()

function Subtitle () {
  function _delay (target) {
    if (target === 'primary') {
      target = 'sub-delay'
    } else if (target === 'secondary') {
      target = 'secondary-sub-delay'
    }
    return misc_util.format_float(mpv_util.get_prop(target, type = 'num'))
  }
  function _retime_primary (incr) {
    mpv_util.run(['add', 'sub-delay', incr])
    mpv_util.print_osd(
      'subtitle/delay-primary> ' + _delay('primary')
    )
  }
  function _retime_secondary (incr) {
    mpv_util.run(['add', 'secondary-sub-delay', incr])
    mpv_util.print_osd(
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
        mpv_util.print_osd(
          'subtitle/delay> (primary, secondary): ' + _delay('primary') + ', ' + _delay('secondary')
        )
      }
    }
  }

  this.resize = function (incr) {
    return function () {
      mpv_util.run(['add', 'sub-scale', incr])
      mpv_util.print_osd(
        'subtitle/scale> ' + misc_util.format_float(mpv_util.get_prop('sub-scale', type = 'num'))
      )
    }
  }

  this.reposition = function (incr) {
    return function () {
      mpv_util.run(['add', 'sub-pos', incr])
      mpv_util.print_osd(
        'subtitle/pos> ' + mpv_util.get_prop('sub-pos', type = 'num')
      )
    }
  }

  this.navigate = function (positive_dir) {
    return function () {
      if (positive_dir) {
        mpv_util.run(['cycle', 'sub', 'up'])
      } else {
        mpv_util.run(['cycle', 'sub', 'down'])
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
}
module.exports.subtitle = new Subtitle()

function Playback () {
  this.navigate_playlist = function (positive_dir) {
    return function () {
      if (positive_dir) {
        mpv_util.run(['playlist-next'])
      } else {
        mpv_util.run(['playlist-prev'])
      }
      report_file.report_playlist()
    }
  }

  this.navigate_file = function (incr, mode) {
    return function () {
      if (mode === 'chapter') {
        mpv_util.run(['add', 'chapter', incr])
        report_file.report_chapter()
      } else {
        mpv_util.run(['seek', incr, 'relative+exact'])
      }
    }
  }

  this.adjust_speed = function (incr) {
    return function () {
      if (!incr) {
        mpv_util.run(['set', 'speed', 1.0])
        mpv_util.print_osd('speed> 1.0')
      } else {
        mpv_util.run(['add', 'speed', incr])
        mpv_util.print_osd('speed> ' + misc_util.format_float(mpv_util.get_prop('speed', type = 'num')))
      }
    }
  }

  this.loop_files = function () {
    mpv_util.cycle('loop-file', ['inf', 'no'])
    mpv_util.print_prop('loop-file')
  }

  this.bind = function () {
    mp.add_key_binding('F8', report_file.report_playlist)
    mp.add_key_binding('F9', function () { mpv_util.print_prop('playlist', type = 'raw') })
    mp.add_key_binding('k', report_file.report_categories)
    mp.add_key_binding('K', function () { mpv_util.print_prop('track-list', type = 'raw') })
    mp.add_key_binding('<', this.navigate_playlist(positive_dir = false))
    mp.add_key_binding('>', this.navigate_playlist(positive_dir = true))

    // mp.add_key_binding('l', function () { mpv_util.run(['ab-loop']) })
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
      mpv_util.run(['script-binding', 'stats/display-stats-toggle'])
    })
    mp.add_key_binding('`', function () {
      // REF:
      // https://github.com/mpv-player/mpv/blob/master/player/lua/console.lua
      mpv_util.run(['script-binding', 'console/enable'])
    })
  }
}
module.exports.playback = new Playback()
