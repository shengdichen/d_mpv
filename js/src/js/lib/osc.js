var util = require("./util").export;

var MODULE = {};

/**
 * @returns {boolean}
 */
MODULE.is_visible_by_default = function () {
  var res = { visibility: "never" };
  util.get_prop_config("osc", res);
  return res.visibility !== "never";
};

MODULE._is_visible = MODULE.is_visible_by_default();

var fn = "osc-visibility";
// NOTE:
//    pass second arg |false| to disable osd-output (prepending 'no-osd' has no use)
MODULE.disable = function () {
  util.run_script_fn(fn, ["never", false]);
};
MODULE.enable = function () {
  util.run_script_fn(fn, ["always", false]);
};
MODULE.toggle = function () {
  MODULE._is_visible = !MODULE._is_visible;
  if (MODULE._is_visible) {
    MODULE.disable();
  } else {
    MODULE.enable();
  }
};

module.exports = {
  export: MODULE,
};
