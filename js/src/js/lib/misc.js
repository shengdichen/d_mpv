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
    osc_is_visible = !osc_is_visible;
    if (osc_is_visible) {
      MODULE.osc.disable();
    } else {
      MODULE.osc.enable();
    }
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

MODULE.config = function () {
  util.raw.add_forced_key_binding("i", MODULE.osc.toggle);
  util.bind("I", MODULE.stats.toggle);
  util.bind("`", MODULE.console.enable);
  util.bind("Shift+s", MODULE.screenshot);

  function title() {
    var title = "";

    var server = util.get_prop("input-ipc-server");
    if (server) {
      // show only filename of socket
      title = title.concat("[" + server.split("/").slice(-1).toString() + "] ");
    }

    title = title.concat("${path}");
    util.set_prop("title", title);
  }

  function savepos() {
    util.set_prop("write-filename-in-watch-later-config", true);
    util.set_prop("ignore-path-in-watch-later-config", true);

    util.set_prop(
      "watch-later-options",
      [
        util.get_prop("watch-later-options", "string"),
        "secondary-sub-delay",
      ].join(",")
    );

    util.bind("Ctrl+s", function () {
      util.cycle("save-position-on-quit");
      util.print_osd(
        "savepos> " + (util.get_prop("save-position-on-quit") ? "T" : "F")
      );
    });
    util.bind("Ctrl+q", function () {
      util.run(["quit-watch-later"]);
    });
  }

  title();
  savepos();
};

module.exports = {
  export: MODULE,
};
