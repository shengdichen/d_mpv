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
    return util_misc.format(title);
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
    var n_tracks = tracks.n_tracks;
    var s =
      "src-id" in track
        ? util_misc.pad_integer_like(track["src-id"], n_tracks)
        : util_misc.space_like(n_tracks.toString());

    return "[" + s + "] ";
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
    return strings ? strings.join(" ") : "??";
  },
};
MODULE.tracking = tracking;

var playback = {
  /**
   * @returns {string}
   */
  time_current_second: function () {
    return util.get_prop_string_formatted("time-pos");
  },

  /**
   * @returns {string}
   */
  time_current_millisecond: function () {
    return util.get_prop_string_formatted("time-pos/full");
  },

  /**
   * @returns {string}
   */
  progress: function () {
    var current = playback.time_current_millisecond();
    var duration = util.get_prop_string_formatted("duration", "raw");
    return "time> " + current + "/" + duration;
  },

  /**
   * @returns {integer}
   */
  chapter: function () {
    return util.get_prop_number("chapter");
  },

  /**
   * @returns {integer}
   */
  edition: function () {
    return util.get_prop_number("edition");
  },
};
MODULE.playback = playback;

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
    return playback.chapter();
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
        formatter.format_id(i + 1 /* use human-indexing */, n_chapters) +
        util_misc.format_as_time(chapters[i].time);

      var c = chapters[i];
      if (c.title) {
        str += " " + formatter.format_title(c.title);
      }

      strings.push(str);
    }

    return strings;
  },
};
MODULE.chapter = chapter;

var playlist = {
  _n_lines_context: 7,

  /**
   * @return {Array.<Object.<string, *>>}
   */
  fetch_items: function () {
    return util.get_prop_object("playlist");
  },

  print_raw: function () {
    var strings = playlist.fetch_items().map(function (i) {
      return util_misc.obj_to_string(i);
    });
    util.print_osd(strings.join("\n"));
  },

  print_pretty: function () {
    var items = playlist.fetch_items();

    if (!items.length) {
      util.print_osd("playlist: ??");
      return;
    }

    var strings = [];
    strings.push("playlist");
    playlist._format_items(items).forEach(function (i) {
      strings.push(i);
    });
    util.print_osd(strings.join("\n"));
  },

  /**
   * @param {Array.<Object.<string, *>>} items
   * @returns {Array.<string>}
   */
  _format_items: function (items) {
    var n_items = items.length;
    var strings = [];

    var i_playing = playlist._index_playing(items);
    var i_start = Math.max(0, i_playing - playlist._n_lines_context);
    var i_end = Math.min(n_items, i_playing + playlist._n_lines_context + 1);

    if (i_start) {
      strings.push(
        util_misc.tab() +
          "// " +
          i_start +
          " " +
          (i_start === 1 ? "item" : "items") +
          " a priori..."
      );
    }

    for (var i = i_start; i < i_end; ++i) {
      var item = items[i];
      var str = ""
        .concat(formatter.format_activeness(item.playing))
        .concat(formatter.format_id(item.id, n_items))
        .concat(item.filename);

      strings.push(str);
    }

    var n_hidden_end = n_items - i_end;
    if (n_hidden_end) {
      strings.push(
        util_misc.tab() +
          "// " +
          n_hidden_end +
          " " +
          (n_hidden_end === 1 ? "item" : "items") +
          " a posteriori..."
      );
    }
    return strings;
  },

  /**
   * @param {Array.<Object.<string, *>>} items
   * @returns {integer}
   */
  _index_playing: function (items) {
    var n_items = items.length;
    for (var i = 0; i < n_items; ++i) {
      if (items[i].playing) {
        return i;
      }
    }
  },
};
MODULE.playlist = playlist;

module.exports = {
  export: MODULE,
};
