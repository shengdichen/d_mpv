var util_misc = require("../util").export;
var util = require("./util").export;

var MODULE = {};

/**
 * @returns {boolean}
 */
function osc_is_visible_by_default() {
  var res = { visibility: "never" };
  util.get_prop_config("osc", res);
  return res.visibility !== "never";
}
var osc_is_visible = osc_is_visible_by_default();
var osc_fn = "osc-visibility";
MODULE.osc = {
  // NOTE:
  //    pass second arg |false| to disable osd-output (prepending 'no-osd' has no use)
  disable: function () {
    util.run_script_fn(osc_fn, ["never", false]);
  },
  enable: function () {
    util.run_script_fn(osc_fn, ["always", false]);
  },
  toggle: function () {
    if (osc_is_visible) {
      MODULE.osc.disable();
    } else {
      MODULE.osc.enable();
    }
    osc_is_visible = !osc_is_visible;
  },
};

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
    if (!util_misc.is_array(targets)) {
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
