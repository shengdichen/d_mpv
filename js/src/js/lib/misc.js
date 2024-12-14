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

module.exports = {
  export: MODULE,
};
