var util = require("../util");
var mpv = require("./util");

var formatter = {
  /**
   * @param {boolean} is_active
   * @param {string} [indicator]
   * @returns {string}
   */
  format_activeness: function (is_active, indicator) {
    return is_active ? indicator || "  > " : util.visual.tab();
  },

  /**
   * @param {integer} i
   * @param {integer} n
   * @returns {string}
   */
  format_id: function (i, n) {
    n = n.toString();
    i = util.format.format_float(i, { n_digits_before_decimal: n.length });
    return i + "/" + n + ")";
  },

  /**
   * @param {string} title
   * @returns {string}
   */
  format_title: function (title) {
    return util.format.format_string(title);
  },
};

// REF
//  https://mpv.io/manual/master/#command-interface-track-list
var tracking = {
  /**
   * @return {Array.<Object.<string, *>>}
   */
  _fetch_tracks_simple: function () {
    return mpv.property.get_object("track-list");
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

      src_ids: [],
      src_id_max: -1,
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

      if ("src-id" in track) {
        res.src_ids.push(track["src-id"]);
        res.src_id_max = Math.max(res.src_id_max, track["src-id"]);
      }
    });

    return res;
  },

  print_raw: function () {
    var strings = tracking._fetch_tracks_simple().map(function (i) {
      return util.format.obj_to_string(i);
    });
    mpv.osd.print(strings.join("\n\n"));
  },

  print_pretty: function () {
    var tracks = tracking._fetch_tracks();

    var strings = [
      tracking._format_tracks_video(tracks),
      tracking._format_tracks_audio(tracks),
      tracking._format_tracks_subtitle(tracks),
    ];
    mpv.osd.print(strings.join(util.visual.separator()));
  },

  print_pretty_video: function () {
    mpv.osd.print(tracking._format_tracks_video(tracking._fetch_tracks()));
  },

  print_pretty_audio: function () {
    mpv.osd.print(tracking._format_tracks_audio(tracking._fetch_tracks()));
  },

  print_pretty_subtitle: function () {
    mpv.osd.print(tracking._format_tracks_subtitle(tracking._fetch_tracks()));
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
      " " +
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
    var src_id_max = tracks.src_id_max;
    var len = src_id_max !== -1 ? src_id_max.toString().length : 0;

    var s =
      "src-id" in track
        ? util.format.format_float(track["src-id"], {
            n_digits_before_decimal: len,
          })
        : util.visual.repeat(" ", len);

    return "[" + s + "]";
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
    return (
      formatter.format_activeness(track.selected) +
      tracking._format_track_id(tracks, track, tracks.n_tracks_video) +
      " " +
      tracking._format_track_video_info(track)
    );
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

      if (util.typing.is_float(fps)) {
        fps = util.format.format_float(fps, { n_digits_after_decimal: 3 });
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
    return (
      formatter.format_activeness(track.selected) +
      tracking._format_track_id(tracks, track, tracks.n_tracks_audio) +
      " " +
      tracking._format_track_audio_info(track)
    );
  },

  /**
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_audio_info: function (track) {
    var strings = [];

    strings.push(track.codec + "[x" + track["demux-channel-count"] + "]");
    if (track.lang) {
      strings.push(track.lang);
    }
    if (track.title) {
      strings.push(formatter.format_title(track.title));
    }

    return strings.join(" ");
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
        return util.visual.tab();
      }

      // REF:
      //  https://mpv.io/manual/master/#command-interface-track-list/n/main-selection
      if (track["main-selection"]) {
        return " >> "; // secondary subtitle
      }
      return "  > "; // primary subtitle
    }

    return (
      active() +
      tracking._format_track_id(tracks, track, tracks.n_tracks_subtitle) +
      " " +
      tracking._format_track_subtitle_info(track)
    );
  },

  /**
   * @param {Object.<string, *>} track
   * @returns {string}
   */
  _format_track_subtitle_info: function (track) {
    var strings = [];

    if (track.lang) {
      strings.push(track.lang);
    }
    if (track.title) {
      strings.push(formatter.format_title(track.title));
    }
    if (track.filename) {
      strings.push("<" + track.filename + ">");
    }

    return strings ? strings.join(" ") : "?";
  },
};

var playback = {
  /**
   * @returns {string}
   */
  time_current_second: function () {
    return mpv.property.get_string_formatted("time-pos");
  },

  /**
   * @returns {string}
   */
  time_current_millisecond: function () {
    return mpv.property.get_string_formatted("time-pos/full");
  },

  /**
   * @returns {string}
   */
  progress: function () {
    var current = playback.time_current_millisecond();
    var duration = mpv.property.get_string_formatted("duration", "raw");
    return "time> " + current + "/" + duration;
  },

  /**
   * @returns {integer}
   */
  chapter: function () {
    return mpv.property.get_number("chapter");
  },

  /**
   * @returns {integer}
   */
  edition: function () {
    return mpv.property.get_number("edition");
  },
};

// REF
//  https://mpv.io/manual/master/#command-interface-chapter-list
var chapter = {
  /**
   * @return {Array.<Object.<string, *>>}
   */
  fetch_chapters: function () {
    return mpv.property.get_object("chapter-list");
  },

  /**
   * @returns {integer}
   */
  fetch_chapter_current: function () {
    return playback.chapter();
  },

  print_raw: function () {
    var strings = chapter.fetch_chapters().map(function (i) {
      return util.format.obj_to_string(i);
    });
    mpv.osd.print(strings.join("\n"));
  },

  print_pretty: function () {
    var chapters = chapter.fetch_chapters();

    if (!chapters.length) {
      mpv.osd.print("chapter: ??");
      return;
    }

    var strings = [];
    strings.push("chapter");
    chapter._format_chapters(chapters).forEach(function (i) {
      strings.push(i);
    });
    mpv.osd.print(strings.join("\n"));
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
      var s = [];

      s.push(
        formatter.format_activeness(i === chapter_curr) +
          formatter.format_id(i + 1 /* use human-indexing */, n_chapters)
      );
      var c = chapters[i];
      s.push(util.format.format_as_time(c.time));
      if (c.title) {
        s.push(formatter.format_title(c.title));
      }

      strings.push(s.join(" "));
    }

    return strings;
  },
};

var playlist = {
  _n_lines_context: 7,
  _n_lines_cycle_max: 3,

  /**
   * @return {Object.<string, *>}
   */
  fetch_playlist: function () {
    var items = mpv.property.get_object("playlist");
    var n_items = items.length;

    var i_zero = 0; // zero-indexing by default in mpv
    var i_min = i_zero;
    var i_max = i_zero + n_items - 1;
    var i_current = i_zero + mpv.property.get_number("playlist-current-pos");

    return {
      items: items,
      n_items: n_items,
      is_empty: n_items === 0,

      _i_zero: i_zero,
      i_min: i_min,
      i_max: i_max,
      i_current: i_current,
    };
  },

  print_raw: function () {
    var strings = playlist.fetch_playlist().items.map(function (i) {
      return util.format.obj_to_string(i);
    });
    mpv.osd.print(strings.join("\n"));
  },

  print_pretty: function () {
    var pl = playlist.fetch_playlist();

    if (pl.is_empty) {
      mpv.osd.print("playlist: ??");
      return;
    }

    var strings = [];
    strings.push("playlist");
    playlist._format_playlist(pl).forEach(function (i) {
      strings.push(i);
    });
    mpv.osd.print(strings.join("\n"));
  },

  /**
   * @param {Object.<string, *>} pl
   * @returns {Array.<string>}
   */
  _format_playlist: function (pl) {
    var n_items = pl.n_items;
    var i_min = pl.i_min;
    var i_max = pl.i_max;

    var i_current = pl.i_current;
    var i_start = Math.max(i_min, i_current - playlist._n_lines_context);
    var i_end = Math.min(i_max, i_current + playlist._n_lines_context);

    var strings = [];

    var n_hidden_start = i_start - i_min;
    if (n_hidden_start) {
      strings.push(playlist._format_items_hidden(n_hidden_start, true));
    }

    var n_lines_cycle = playlist._n_lines_cycle(n_items);

    var n_lines_cycle_start = n_lines_cycle - (i_current - i_min);
    if (n_lines_cycle_start > 0) {
      // reverse of: (var i = i_max; i > i_max - n_lines_cycle_start; --i)
      for (var i = i_max + 1 - n_lines_cycle_start; i < i_max + 1; ++i) {
        strings.push(playlist._format_item(pl.items[i], n_items));
      }
      strings.push("----START" + util.visual.separator_no_linebreaks());
    }

    for (i = i_start; i <= i_end; ++i) {
      strings.push(playlist._format_item(pl.items[i], n_items));
    }

    var n_lines_cycle_end = n_lines_cycle - (i_max - i_current);
    if (n_lines_cycle_end > 0) {
      strings.push("----END" + util.visual.separator_no_linebreaks());
      for (i = i_min; i < i_min + n_lines_cycle_end; ++i) {
        strings.push(playlist._format_item(pl.items[i], n_items));
      }
    }

    var n_hidden_end = i_max - i_end;
    if (n_hidden_end) {
      strings.push(playlist._format_items_hidden(n_hidden_end));
    }
    return strings;
  },

  /**
   * @param {Object.<string, *>} item
   * @param {interger} n_items
   * @returns {string}
   */
  _format_item: function (item, n_items) {
    // NOTE:
    //  use .current to check current track; .playing does NOT update when
    //  switching tracks and will thus report erroneously
    var active = formatter.format_activeness(item.current);
    var id = formatter.format_id(item.id, n_items);

    var filename = util.path.name(item.filename);
    if (filename.length > 79) {
      filename = "..." + filename.slice(-79);
    }

    return active + id + " " + filename;
  },

  /**
   * @param {interger} n_items
   * @returns {integer}
   */
  _n_lines_cycle: function (n_items) {
    // NOTE:
    //  n_items <=> n_lines_cycle
    //  0           0
    //  1           0
    //  2           1
    //  3           2
    //  4           3 := n_lines_cycle_max
    //  ...         3
    return util.math.clamp(n_items - 1, 0, playlist._n_lines_cycle_max);
  },

  /**
   * @param {number} n_items_hidden
   * @param {boolean} direction_start
   * @returns {string}
   */
  _format_items_hidden: function (n_items_hidden, direction_start) {
    return (
      util.visual.tab() +
      "// " +
      n_items_hidden +
      " " +
      (n_items_hidden === 1 ? "item" : "items") +
      (direction_start ? " a priori..." : " a posteriori...")
    );
  },
};

module.exports = {
  tracking: tracking,
  playback: playback,
  chapter: chapter,
  playlist: playlist,
};
