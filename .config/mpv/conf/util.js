var util_misc = new function () {
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
}()

var util_mpv = new function () {
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
}()

var report_file = new function () {
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
    util_mpv.print_osd(strings.join(separator))
  }

  this.report_category_video = function () {
    util_mpv.print_osd(_format_category_video(_categorize_one('video')))
  }

  this.report_category_audio = function () {
    util_mpv.print_osd(_format_category_audio(_categorize_one('audio')))
  }

  this.report_category_sub = function () {
    util_mpv.print_osd(_format_category_sub(_categorize_one('sub')))
  }

  function _categorize () {
    var tracks = util_mpv.get_prop('track-list')
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
    var tracks = util_mpv.get_prop('track-list')
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
            fps = util_misc.format_float(fps, n_digits_after_decimal = 3)
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
    var chapters = util_mpv.get_prop('chapter-list')
    var n_chapters = chapters.length
    if (!n_chapters) {
      util_mpv.print_osd(_format_tracks_empty(strings))
    } else {
      for (var i = 0; i < n_chapters; i++) {
        var c = chapters[i]
        var str = _format_track_selected(util_mpv.get_prop('chapter') === i)
        str = str.concat((i + 1) + '/' + n_chapters + ')')
        if (c.title) { str = str.concat(" '" + c.title + "'") }
        strings.push(str)
      }
      util_mpv.print_osd(strings.join('\n'))
    }
  }

  this.report_playlist = function () {
    var strings = []
    strings.push('playlist')
    var files = util_mpv.get_prop('playlist')
    var n_files = files.length
    if (!n_files) {
      util_mpv.print_osd(_format_tracks_empty(strings))
    } else {
      for (var i = 0; i < n_files; i++) {
        var f = files[i]
        var str = _format_track_selected(f.playing)
        str = str.concat(util_misc.pad_integer_to(f.id, n_files) + '/' + n_files + ') ' + f.filename)
        strings.push(str)
      }
      util_mpv.print_osd(strings.join('\n'))
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
    str = str.concat(util_misc.pad_integer_to(track.id, n_tracks))
    str = str.concat('/' + n_tracks + ') ')
    return str
  }

  function _format_id_global (track, n_tracks_global) {
    var str = ''
    if (track['src-id']) {
      str = str.concat('[' + util_misc.pad_integer_to(track['src-id'], n_tracks_global) + '] ')
    }
    return str
  }
}()

module.exports.util_misc = util_misc
module.exports.util_mpv = util_mpv
module.exports.report_file = report_file
