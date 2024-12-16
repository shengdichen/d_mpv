var util_misc = require("../util").export;
var util = require("./util").export;

var MODULE = {};

var formatter = {
  /**
   * @param {boolean} is_active
   * @param {string} [indicator]
   * @returns {string}
   */
  format_activeness: function (is_active, indicator) {
    return is_active ? indicator || "  > " : util_misc.tab();
  },

  /**
   * @param {integer} i
   * @param {integer} n
   * @returns {string}
   */
  format_id: function (i, n) {
    return util_misc.pad_integer_like(i, n) + "/" + n + ") ";
  },

  /**
   * @param {string} title
   * @returns {string}
   */
  format_title: function (title) {
    return "'" + title + "'";
  },
};

// REF
//  https://mpv.io/manual/master/#command-interface-track-list
var tracking = {
  /**
   * @return {Array.<Object.<string, *>>}
   */
  _fetch_tracks_simple: function () {
    return util.get_prop_object("track-list");
  },

  _fetch_tracks: function () {
    var tracks = tracking._fetch_tracks_simple();
    var res = {
      tracks: tracks /* array of objects */,
      tracks_video: [] /* ditto*/,
      tracks_audio: [] /* ditto */,
      tracks_subtitle: [] /* ditto */,
      n_tracks: tracks.length,
      n_tracks_video: 0,
      n_tracks_audio: 0,
      n_tracks_subtitle: 0,
    };

    tracks.forEach(function (track) {
      switch (track.type) {
        case "video":
          res.tracks_video.push(track);
          res.n_tracks_video += 1;
          break;
        case "audio":
          res.tracks_audio.push(track);
          res.n_tracks_audio += 1;
          break;
        case "sub":
          res.tracks_subtitle.push(track);
          res.n_tracks_subtitle += 1;
          break;
        default:
          break; /* intentionally left empty */
      }
    });

    return res;
  },

  print_raw: function () {
    var strings = tracking._fetch_tracks_simple().map(function (i) {
      return util_misc.obj_to_string(i);
    });
    util.print_osd(strings.join("\n\n"));
  },

  print_pretty: function () {
    var tracks = tracking._fetch_tracks();

    var strings = [
      tracking._format_tracks_video(tracks),
      tracking._format_tracks_audio(tracks),
      tracking._format_tracks_subtitle(tracks),
    ];
    util.print_osd(strings.join(util_misc.separator()));
  },

  print_pretty_video: function () {
    util.print_osd(tracking._format_tracks_video(tracking._fetch_tracks()));
  },

  print_pretty_audio: function () {
    util.print_osd(tracking._format_tracks_audio(tracking._fetch_tracks()));
  },

  print_pretty_subtitle: function () {
    util.print_osd(tracking._format_tracks_subtitle(tracking._fetch_tracks()));
  },

  /**
   * @param {object} tracks
   * @param {object} track
   * @param {object} n_tracks_type
   * @returns {string}
   */
  _format_track_id: function (tracks, track, n_tracks_type) {
    return (
      tracking._format_track_id_global(tracks, track) +
      formatter.format_id(track.id, n_tracks_type)
    );
  },

  /**
   * @param {object} tracks
   * @param {object} track
   * @param {string} [indicator]
   * @returns {string}
   */
  _format_track_id_global: function (tracks, track) {
    if (!("src-id" in track)) {
      return "";
    }
    return (
      "[" + util_misc.pad_integer_like(track["src-id"], tracks.n_tracks) + "] "
    );
  },

  /**
   * @param {object} tracks
   * @returns {string}
   */
  _format_tracks_video: function (tracks) {
    if (!tracks.tracks_video.length) {
      return "vid: ??";
    }

    var strings = ["vid"];
    tracks.tracks_video.forEach(function (track) {
      strings.push(tracking._format_track_video(tracks, track));
    });
    return strings.join("\n");
  },

  /**
   * @param {object} tracks
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_video: function (tracks, track) {
    return ""
      .concat(formatter.format_activeness(track.selected))
      .concat(tracking._format_track_id(tracks, track, tracks.n_tracks_video))
      .concat(tracking._format_track_video_info(track));
  },

  /**
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_video_info: function (track) {
    function fps() {
      var fps = track["demux-fps"];
      if (!fps) {
        return "";
      }
      if (fps === 1) {
        return "[static]";
      }

      if (util_misc.is_float(fps)) {
        fps = util_misc.truncate_after_decimal(fps, 3);
      }
      return "@" + fps + "fps";
    }

    function dimension() {
      if (!(track["demux-w"] && track["demux-h"])) {
        return "";
      }
      return track["demux-w"] + "x" + track["demux-h"];
    }

    return track.codec + fps() + " " + dimension();
  },

  /**
   * @param {object} tracks
   * @returns {string}
   */
  _format_tracks_audio: function (tracks) {
    if (!tracks.tracks_audio.length) {
      return "aud: ??";
    }

    var strings = ["aud"];
    tracks.tracks_audio.forEach(function (track) {
      strings.push(tracking._format_track_audio(tracks, track));
    });
    return strings.join("\n");
  },

  /**
   * @param {object} tracks
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_audio: function (tracks, track) {
    return ""
      .concat(formatter.format_activeness(track.selected))
      .concat(tracking._format_track_id(tracks, track, tracks.n_tracks_audio))
      .concat(tracking._format_track_audio_info(track));
  },

  /**
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_audio_info: function (track) {
    var str = track.codec + "[x" + track["demux-channel-count"] + "]";
    if (!("lang" in track)) {
      return str;
    }
    return str.concat(" " + track.lang);
  },

  /**
   * @param {object} tracks
   * @returns {string}
   */
  _format_tracks_subtitle: function (tracks) {
    if (!tracks.tracks_subtitle.length) {
      return "sub: ??";
    }

    var strings = ["sub"];
    tracks.tracks_subtitle.forEach(function (track) {
      strings.push(tracking._format_track_subtitle(tracks, track));
    });
    return strings.join("\n");
  },

  /**
   * @param {object} tracks
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_subtitle: function (tracks, track) {
    function active() {
      if (!track.selected) {
        return util_misc.tab();
      }

      // REF:
      //  https://mpv.io/manual/master/#command-interface-track-list/n/main-selection
      if (track["main-selection"]) {
        return " >> "; // secondary subtitle
      }
      return "  > "; // primary subtitle
    }

    return ""
      .concat(active())
      .concat(
        tracking._format_track_id(tracks, track, tracks.n_tracks_subtitle)
      )
      .concat(tracking._format_track_subtitle_info(track));
  },

  /**
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_subtitle_info: function (track) {
    if (track.lang) {
      return track.lang;
    }
    if (track.title) {
      return track.title;
    }
    if (track.filename) {
      return track.filename;
    }
    return "??";
  },
};
MODULE.tracking = tracking;

// REF
//  https://mpv.io/manual/master/#command-interface-chapter-list
var chapter = {
  /**
   * @return {Array.<Object.<string, *>>}
   */
  fetch_chapters: function () {
    return util.get_prop_object("chapter-list");
  },

  /**
   * @returns {integer}
   */
  fetch_chapter_current: function () {
    return util.get_prop_number("chapter");
  },

  print_raw: function () {
    var strings = chapter.fetch_chapters().map(function (i) {
      return util_misc.obj_to_string(i);
    });
    util.print_osd(strings.join("\n"));
  },

  print_pretty: function () {
    var chapters = chapter.fetch_chapters();

    if (!chapters.length) {
      util.print_osd("chapter: ??");
      return;
    }

    var strings = [];
    strings.push("chapter");
    chapter._format_chapters(chapters).forEach(function (i) {
      strings.push(i);
    });
    util.print_osd(strings.join("\n"));
  },

  /**
   * @param {Array.<Object.<string, *>>} chapters
   * @returns {Array.<string>}
   */
  _format_chapters: function (chapters) {
    var n_chapters = chapters.length;
    var chapter_curr = chapter.fetch_chapter_current();
    var strings = [];
    for (var i = 0; i < n_chapters; ++i) {
      var str =
        formatter.format_activeness(i === chapter_curr) +
        formatter.format_id(i + 1 /* use human-indexing */, n_chapters);

      var c = chapters[i];
      if (c.title) {
        str += formatter.format_title(c.title);
      }

      strings.push(str);
    }

    return strings;
  },
};
MODULE.chapter = chapter;

MODULE.report_playlist = function () {
  var strings = [];
  strings.push("playlist");
  var files = util.get_prop_object("playlist");
  var n_files = files.length;
  if (!n_files) {
    util.print_osd(_format_tracks_empty(strings));
  } else {
    for (var i = 0; i < n_files; ++i) {
      var f = files[i];
      var str = _format_track_selected(f.playing);
      str = str.concat(
        util_misc.pad_integer_like(f.id, n_files) +
          "/" +
          n_files +
          ") " +
          f.filename
      );
      strings.push(str);
    }
    util.print_osd(strings.join("\n"));
  }
};

function _format_tracks_empty(strings) {
  strings.push("  ?");
  return strings.join("\n");
}

function _format_track_selected(test) {
  return test ? "  > " : "    ";
}

module.exports = {
  export: MODULE,
};
