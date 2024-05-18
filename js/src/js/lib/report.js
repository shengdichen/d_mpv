var util_misc = require("../util").export;
var util = require("./util").export;

var MODULE = {};

MODULE.report_categories = function () {
  var categories = _categorize();
  var vids = categories[0];
  var auds = categories[1];
  var subs = categories[2];
  var n_tracks_global = categories[3];

  var strings = [];
  strings.push(_format_category_video(vids, n_tracks_global));
  strings.push(_format_category_audio(auds, n_tracks_global));
  strings.push(_format_category_sub(subs, n_tracks_global));
  var separator = "\n" + Array(37).join("-") + "\n";
  util.print_osd(strings.join(separator));
};

MODULE.report_category_video = function () {
  util.print_osd(_format_category_video(_categorize_one("video")));
};

MODULE.report_category_audio = function () {
  util.print_osd(_format_category_audio(_categorize_one("audio")));
};

MODULE.report_category_sub = function () {
  util.print_osd(_format_category_sub(_categorize_one("sub")));
};

function _categorize() {
  var tracks = util.get_prop_object("track-list");
  var vids = [];
  var auds = [];
  var subs = [];
  for (var i = 0; i < tracks.length; ++i) {
    var t = tracks[i];
    if (t.type === "video") {
      vids.push(t);
    } else if (t.type === "audio") {
      auds.push(t);
    } else if (t.type === "sub") {
      subs.push(t);
    }
  }
  return [vids, auds, subs, tracks.length];
}

function _categorize_one(type) {
  var tracks = util.get_prop_object("track-list");
  var category = [];
  for (var i = 0; i < tracks.length; ++i) {
    if (tracks[i].type === type) {
      category.push(tracks[i]);
    }
  }
  return category;
}

function _format_category_video(tracks, n_tracks_global) {
  var strings = [];
  strings.push("vid");
  if (!tracks.length) {
    return _format_tracks_empty(strings);
  }

  var n_tracks = tracks.length;
  for (var i = 0; i < n_tracks; ++i) {
    var t = tracks[i];
    var str = _format_track_selected(t.selected);
    if (n_tracks_global) {
      str = str.concat(_format_id_global(t, n_tracks_global));
    }
    str = str.concat(_format_id_in_category(t, n_tracks));
    str = str.concat(t.codec);
    var fps = t["demux-fps"];
    if (fps) {
      if (fps === 1) {
        str = str.concat("[static]");
      } else {
        if (util_misc.is_float(fps)) {
          fps = util_misc.truncate_after_decimal(fps, 3);
        }
        str = str.concat("@" + fps + "fps");
      }
    }
    if (t["demux-w"] && t["demux-h"]) {
      str = str.concat(" " + t["demux-w"] + "x" + t["demux-h"]);
    }
    strings.push(str);
  }
  return strings.join("\n");
}

function _format_category_audio(tracks, n_tracks_global) {
  var strings = [];
  strings.push("aud");
  if (!tracks.length) {
    return _format_tracks_empty(strings);
  }

  var n_tracks = tracks.length;
  for (var i = 0; i < n_tracks; ++i) {
    var t = tracks[i];
    var str = _format_track_selected(t.selected);
    if (n_tracks_global) {
      str = str.concat(_format_id_global(t, n_tracks_global));
    }
    str = str.concat(_format_id_in_category(t, n_tracks));
    str = str.concat(t.codec + "[x" + t["demux-channel-count"] + "]");
    if (t.lang) {
      str = str.concat(" " + t.lang);
    }
    strings.push(str);
  }
  return strings.join("\n");
}

function _format_category_sub(tracks, n_tracks_global) {
  var strings = [];
  strings.push("sub");
  if (!tracks.length) {
    return _format_tracks_empty(strings);
  }

  var n_tracks = tracks.length;
  for (var i = 0; i < n_tracks; ++i) {
    var t = tracks[i];
    var str = "";
    if (t.selected) {
      // REF:
      //  https://mpv.io/manual/master/#command-interface-track-list/n/main-selection
      if (t["main-selection"]) {
        str = str.concat(" >> "); // secondary subtitle
      } else {
        str = str.concat("  > "); // primary subtitle
      }
    } else {
      str = str.concat("    ");
    }
    if (n_tracks_global) {
      str = str.concat(_format_id_global(t, n_tracks_global));
    }
    str = str.concat(_format_id_in_category(t, n_tracks));
    if (t.lang) {
      str = str.concat(t.lang);
    }
    strings.push(str);
  }
  return strings.join("\n");
}

MODULE.report_chapter = function () {
  var strings = [];
  strings.push("chapter");
  var chapters = util.get_prop_object("chapter-list");
  var n_chapters = chapters.length;
  if (!n_chapters) {
    util.print_osd(_format_tracks_empty(strings));
  } else {
    for (var i = 0; i < n_chapters; ++i) {
      var c = chapters[i];
      var str = _format_track_selected(util.get_prop_number("chapter") === i);
      str = str.concat(i + 1 + "/" + n_chapters + ")");
      if (c.title) {
        str = str.concat(" '" + c.title + "'");
      }
      strings.push(str);
    }
    util.print_osd(strings.join("\n"));
  }
};

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

function _format_id_in_category(track, n_tracks) {
  var str = "";
  str = str.concat(util_misc.pad_integer_like(track.id, n_tracks));
  str = str.concat("/" + n_tracks + ") ");
  return str;
}

function _format_id_global(track, n_tracks_global) {
  if (track["src-id"]) {
    return (
      "[" + util_misc.pad_integer_like(track["src-id"], n_tracks_global) + "] "
    );
  }
  return "";
}

module.exports = {
  export: MODULE,
};
