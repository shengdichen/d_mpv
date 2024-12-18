var util = require("../util");
var mpv = require("./util");

var osc = {
  _fn: "osc-visibility",
  // NOTE:
  //    first toggle() will:
  //    1.  disable() := osc/visibility is always
  //    2.  enable() := osc/visibility is unset OR auto (default) OR never
  _is_visible:
    mpv.property.get_prop_script(
      "osc",
      "visibility",
      "auto" /* REF: https://mpv.io/manual/master/#on-screen-controller-visibility */
    ) === "always",

  // NOTE:
  //    pass second arg |false| to disable osd-output (prepending "no-osd" has no use)
  disable: function () {
    mpv.exec.run_script_fn(osc._fn, ["never", false]);
  },
  enable: function () {
    mpv.exec.run_script_fn(osc._fn, ["always", false]);
  },
  toggle: function () {
    if (osc._is_visible) {
      osc.disable();
    } else {
      osc.enable();
    }
    osc._is_visible = !osc._is_visible;
  },
};

var stats = {
  toggle: function () {
    // REF:
    // https://github.com/Argon-/mpv-stats/blob/master/stats.lua
    // https://github.com/mpv-player/mpv/blob/master/player/lua/stats.lua
    mpv.exec.run_script_bind("stats", "display-stats-toggle");
  },
};

var _console = {
  enable: function () {
    // REF:
    // https://github.com/mpv-player/mpv/blob/master/player/lua/console.lua
    mpv.exec.run_script_bind("console", "enable");
  },
};

var screenshot = function () {
  mpv.exec.run("screenshot");
};

var record = {
  /**
   * @returns {string}
   */
  get_targets: function () {
    return mpv.property.get_string("watch-later-options");
  },

  /**
   * @param {string} str_targets
   */
  set_targets: function (str_targets) {
    mpv.property.set_string("watch-later-options", str_targets);
  },

  /**
   * @param {Array.<string>|string} targets
   */
  append_targets: function (targets) {
    if (!util.typing.is_array(targets)) {
      record.set_targets(record.get_targets() + "," + targets);
      return;
    }

    var str_append = "";
    for (var i = 0; i < targets.length; ++i) {
      str_append += "," + targets[i];
    }
    record.set_targets(record.get_targets() + str_append);
  },

  save_filename_only: function () {
    mpv.property.set_boolean("write-filename-in-watch-later-config", true);
    mpv.property.set_boolean("ignore-path-in-watch-later-config", true);
  },

  save: function () {
    mpv.exec.run("write-watch-later-config");
    mpv.osd.print("savepos> written");
  },

  save_quit: function () {
    mpv.exec.run("quit-watch-later");
  },

  toggle: function () {
    mpv.property.cycle("save-position-on-quit");
    mpv.osd.print(
      "savepos> " +
        (mpv.property.get_boolean("save-position-on-quit") ? "T" : "F")
    );
  },
};

module.exports = {
  osc: osc,
  stats: stats,
  console: _console,
  screenshot: screenshot,
  record: record,
};
