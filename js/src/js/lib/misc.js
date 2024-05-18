var util = require("./util").export;

var MODULE = {};

MODULE.osc = {};
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
// NOTE:
//    pass second arg |false| to disable osd-output (prepending 'no-osd' has no use)
MODULE.osc.disable = function () {
  util.run_script_fn(osc_fn, ["never", false]);
};
MODULE.osc.enable = function () {
  util.run_script_fn(osc_fn, ["always", false]);
};
MODULE.osc.toggle = function () {
  osc_is_visible = !osc_is_visible;
  if (osc_is_visible) {
    MODULE.osc.disable();
  } else {
    MODULE.osc.enable();
  }
};

MODULE.screenshot = function () {
  util.run(["screenshot"]);
};

MODULE.title = function () {
  var title = "";

  var server = util.get_prop("input-ipc-server");
  if (server) {
    // show only filename of socket
    title = title.concat("[" + server.split("/").slice(-1).toString() + "] ");
  }

  title = title.concat("${path}");
  util.set_prop("title", title);
};

MODULE.savepos = function () {
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
};

MODULE.config = function () {
  util.raw.add_forced_key_binding("i", MODULE.osc.toggle);

  util.bind("Shift+s", MODULE.screenshot);
  MODULE.savepos();

  util.bind("I", function () {
    // REF:
    // https://github.com/Argon-/mpv-stats/blob/master/stats.lua
    // https://github.com/mpv-player/mpv/blob/master/player/lua/stats.lua
    util.run_script_bind("stats", "display-stats-toggle");
  });
  util.bind("`", function () {
    // REF:
    // https://github.com/mpv-player/mpv/blob/master/player/lua/console.lua
    util.run_script_bind("console", "enable");
  });
};

module.exports = {
  export: MODULE,
};
