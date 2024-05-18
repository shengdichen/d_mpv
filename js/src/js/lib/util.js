var util_misc = require("../util").export;

var MODULE = {};

MODULE.raw = mp; // eslint-disable-line no-undef

/**
 * @param {string} key
 * @param {function(): void} fn
 * @param {Object.<string, *>} [opts]
 */
MODULE.bind = function (key, fn, opts) {
  if (!opts) {
    this.raw.add_key_binding(key, fn, { repeatable: true });
    return;
  }

  opts.repeatable = util_misc.has_member(opts, "repeatable")
    ? opts.repeatable
    : true;
  if (opts.force) {
    this.raw.add_forced_key_binding(key, fn, delete opts.force);
  } else {
    this.raw.add_key_binding(key, fn, opts);
  }
};

/**
 * @param {string} text
 * @param {number} [duration]
 */
MODULE.print_osd = function (text, duration) {
  duration = duration ? duration : 0.7;
  this.raw.osd_message(text, duration);
};

/**
 * @param {Array.<string>|string} fragments
 */
MODULE.run = function (fragments) {
  if (!Array.isArray(fragments)) {
    this.raw.command(fragments);
  } else {
    this.raw.commandv.apply(null, fragments);
  }
};

/**
 * @param {string} script
 * @param {string} bind
 */
MODULE.run_script_bind = function (script, bind) {
  // REF:
  //  https://mpv.io/manual/master/#command-interface-script-binding
  this.run(["script-binding", script + "/" + bind]);
};

/**
 * @param {string} fn
 * @param {Array.<string>} args
 */
MODULE.run_script_fn = function (fn, args) {
  this.run(["script-message", fn].concat(args));
};

/**
 * @param {string} prop
 * @param {string} type
 * @param {*} def
 * @returns {*}
 */
MODULE.get_prop = function (prop, type, def) {
  if (type === "bool") {
    return this.raw.get_property_bool(prop, def);
  }
  if (type === "num") {
    return this.raw.get_property_number(prop, def);
  }
  if (type === "string") {
    return this.raw.get_property(prop, def);
  }
  if (type === "raw") {
    return this.raw.get_property_osd(prop, def);
  }
  return this.raw.get_property_native(prop, def);
};

/**
 * @param {string} prop
 * @param {*} val
 * @param {string} type
 */
MODULE.set_prop = function (prop, val, type) {
  if (type === "bool") {
    return this.raw.set_property_bool(prop, val);
  }
  if (type === "num") {
    return this.raw.set_property_number(prop, val);
  }
  if (type === "raw") {
    return this.raw.set_property(prop, val);
  }
  return this.raw.set_property_native(prop, val);
};

/**
 * @param {string} item
 * @param {Array.<*>} [values]
 */
MODULE.cycle = function (item, values) {
  if (!values) {
    this.run(["cycle", item]);
  } else {
    this.run(["cycle-values", item].concat(values));
  }
};

/**
 * @param {string} prop
 * @param {string} type
 * @param {*} def
 */
MODULE.print_prop = function (prop, type, def) {
  this.print_osd(this.get_prop(prop, type, def));
};

/**
 * @param {string} prop
 * @param {Object.<string, *>} def
 * @returns {Object.<string, *>}
 */
MODULE.get_prop_config = function (prop, def) {
  this.raw.options.read_options(def, prop);
  return def;
};

module.exports = {
  export: MODULE,
};
