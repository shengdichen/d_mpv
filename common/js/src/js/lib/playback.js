var util = require("../util");
var report = require("./report");
var video = require("./video");
var mpv = require("./util");
var misc = require("./misc");

var playpause = {
  /**
   * @returns {boolean}
   */
  is_playing: function () {
    return !mpv.property.get_boolean("pause");
  },

  enable: function () {
    mpv.property.set_boolean("pause", false);
    misc.osc.disable();

    if (report.tracking.is_music()) {
      video.activation.enable();
    }
  },

  disable: function () {
    mpv.property.set_boolean("pause", true);
    misc.osc.enable();

    if (report.tracking.is_music()) {
      video.activation.disable();
    }
  },

  toggle: function () {
    if (playpause.is_playing()) {
      playpause.disable();
      return;
    }
    playpause.enable();
  },
};

var playlist = {
  /**
   * @param {integer} offset
   */
  _shift: function (offset) {
    if (offset > 0) {
      for (var i = 0; i < offset; ++i) {
        mpv.exec.run("playlist-next");
      }
      return;
    }

    for (i = 0; i > offset; --i) {
      mpv.exec.run("playlist-prev");
    }
  },

  /**
   * @param {integer} offset
   */
  shift: function (offset) {
    playlist._shift(offset);
    report.playlist.print_pretty();
  },
};

var navigate = {
  /**
   * @param {integer} offset
   */
  frame: function (offset) {
    if (!offset) return;

    if (offset > 0) {
      for (var i = 0; i < offset; ++i) {
        mpv.exec.run("frame-step");
      }
    } else {
      offset = -offset;
      for (i = 0; i < offset; ++i) {
        mpv.exec.run("frame-back-step");
      }
    }
    mpv.osd.print(report.playback.progress());
  },

  /**
   * @param {number} offset
   */
  time: function (offset) {
    mpv.exec.run(["seek", offset, "relative+exact"]);
    mpv.osd.print(report.playback.progress());
  },

  /**
   * @param {integer} offset
   */
  chapter: function (offset) {
    mpv.exec.run(["add", "chapter", offset]);
    report.chapter.print_pretty();
  },
};

var speed = {
  /**
   * @returns {string}
   */
  get: function () {
    return util.format.format_float(mpv.property.get_number("speed"), {
      n_digits_after_decimal: 2,
    });
  },

  /**
   * @returns {string}
   */
  print: function () {
    mpv.osd.print("playback/speed> " + speed.get());
  },

  /**
   * @param {number} [val]
   */
  set: function (val) {
    mpv.exec.run(["set", "speed", val || 1]);
    speed.print();
  },

  /**
   * @param {number} offset
   */
  shift: function (offset) {
    mpv.exec.run(["add", "speed", offset]);
    speed.print();
  },
};

var loop = {
  loop_files: function () {
    mpv.property.cycle("loop-file", ["inf", "no"]);
    mpv.osd.print_prop_autotype("loop-file");
  },

  _loop_ab_bound: function (mode) {
    var bound = mpv.property.get_number("ab-loop-" + mode);
    if (bound === undefined /* bound not set */) return "";
    return util.format.format_as_time(bound);
  },

  /**
   * @returns {string}
   */
  loop_ab_bound_a: function () {
    return loop._loop_ab_bound("a");
  },

  /**
   * @returns {string}
   */
  loop_ab_bound_b: function () {
    return loop._loop_ab_bound("b");
  },

  /**
   * @returns {string}
   */
  loop_ab_bound_formatted: function () {
    var bound_a = loop.loop_ab_bound_a();
    var bound_b = loop.loop_ab_bound_b();

    if (bound_a) {
      if (bound_b) {
        return bound_a + " <--> " + bound_b;
      }
      return bound_a + " ->?";
    }
    return "?";
  },

  loop_ab: function () {
    mpv.exec.run("ab-loop");
    mpv.osd.print("loop-ab> " + loop.loop_ab_bound_formatted());
  },
};

module.exports = {
  playpause: playpause,
  playlist: playlist,
  navigate: navigate,
  speed: speed,
  loop: loop,
};
