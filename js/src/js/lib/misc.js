var util_misc = require("../util");
var util = require("./util").export;

var MODULE = {};

var _osc = {
  _fn: "osc-visibility",
  // NOTE:
  //    first toggle() will:
  //    1.  disable() := osc/visibility is always
  //    2.  enable() := osc/visibility is unset OR auto (default) OR never
  _is_visible:
    util.get_prop_script(
      "osc",
      "visibility",
      "auto" /* REF: https://mpv.io/manual/master/#on-screen-controller-visibility */
    ) === "always",

  // NOTE:
  //    pass second arg |false| to disable osd-output (prepending "no-osd" has no use)
  disable: function () {
    util.run_script_fn(_osc._fn, ["never", false]);
  },
  enable: function () {
    util.run_script_fn(_osc._fn, ["always", false]);
  },
  toggle: function () {
    if (_osc._is_visible) {
      _osc.disable();
    } else {
      _osc.enable();
    }
    _osc._is_visible = !_osc._is_visible;
  },
};
MODULE.osc = _osc;

MODULE.stats = {
  toggle: function () {
    // REF:
    // https://github.com/Argon-/mpv-stats/blob/master/stats.lua
    // https://github.com/mpv-player/mpv/blob/master/player/lua/stats.lua
    util.run_script_bind("stats", "display-stats-toggle");
  },
};

MODULE.console = {
  enable: function () {
    // REF:
    // https://github.com/mpv-player/mpv/blob/master/player/lua/console.lua
    util.run_script_bind("console", "enable");
  },
};

MODULE.screenshot = function () {
  util.run(["screenshot"]);
};

var _record = {
  /**
   * @returns {string}
   */
  get_targets: function () {
    return util.get_prop_string("watch-later-options");
  },

  /**
   * @param {string} str_targets
   */
  set_targets: function (str_targets) {
    util.set_prop_string("watch-later-options", str_targets);
  },

  /**
   * @param {Array.<string>|string} targets
   */
  append_targets: function (targets) {
    if (!util_misc.typing.is_array(targets)) {
      _record.set_targets(_record.get_targets() + "," + targets);
      return;
    }

    var str_append = "";
    for (var i = 0; i < targets.length; ++i) {
      str_append += "," + targets[i];
    }
    _record.set_targets(_record.get_targets() + str_append);
  },

  save_filename_only: function () {
    util.set_prop_boolean("write-filename-in-watch-later-config", true);
    util.set_prop_boolean("ignore-path-in-watch-later-config", true);
  },

  save: function () {
    util.run("write-watch-later-config");
    util.print_osd("savepos> written");
  },

  save_quit: function () {
    util.run("quit-watch-later");
  },

  toggle: function () {
    util.cycle("save-position-on-quit");
    util.print_osd(
      "savepos> " + (util.get_prop_boolean("save-position-on-quit") ? "T" : "F")
    );
  },
};
MODULE.record = _record;

module.exports = {
  export: MODULE,
};
