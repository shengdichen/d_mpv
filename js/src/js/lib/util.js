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
 * @param {boolean} def
 * @returns {boolean}
 */
MODULE.get_prop_boolean = function (prop, def) {
  return MODULE.raw.get_property_bool(prop, def);
};

/**
 * @param {string} prop
 * @param {number} def
 * @returns {number}
 */
MODULE.get_prop_number = function (prop, def) {
  return MODULE.raw.get_property_number(prop, def);
};

/**
 * @param {string} prop
 * @param {string} def
 * @returns {string}
 */
MODULE.get_prop_string = function (prop, def) {
  return MODULE.raw.get_property(prop, def);
};

/**
 * get property as string, but formatted by mpv's default
 * @param {string} prop
 * @param {string} def
 * @returns {string}
 */
MODULE.get_prop_string_formatted = function (prop, def) {
  return MODULE.raw.get_property_osd(prop, def);
};

/**
 * get property as object, but converted to object with |\_prop| as key if not
 * an object by default, i.e., boolean or number or string
 * @param {string} prop
 * @param {Object} def
 * @returns {Object.<string, *>|Array.<*>}
 */
MODULE.get_prop_object = function (prop, def) {
  var res = MODULE.raw.get_property_native(prop, def);
  if (util_misc.is_object(res)) {
    return res;
  }
  return { _prop: res };
};

/**
 * get property, but (type-)converted by mpv's default (useful if type of
 * property is not constant, e.g., can be both boolean or string)
 * @param {string} prop
 * @param {boolean|number|string|Object} def
 * @returns {boolean|number|string|Object}
 */
MODULE.get_prop_autotype = function (prop, def) {
  return MODULE.raw.get_property_native(prop, def);
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
 * @param {string} prop
 * @param {boolean} val
 */
MODULE.set_prop_boolean = function (prop, val) {
  return MODULE.raw.set_property_bool(prop, val);
};

/**
 * @param {string} prop
 * @param {number} val
 */
MODULE.set_prop_number = function (prop, val) {
  return MODULE.raw.set_property_number(prop, val);
};

/**
 * @param {string} prop
 * @param {string} val
 */
MODULE.set_prop_string = function (prop, val) {
  return MODULE.raw.set_property(prop, val);
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
 * @param {boolean} def
 */
MODULE.print_prop_boolean = function (prop, def) {
  MODULE.print_osd(MODULE.get_prop_boolean(prop, def));
};

/**
 * @param {string} prop
 * @param {number} def
 */
MODULE.print_prop_number = function (prop, def) {
  MODULE.print_osd(MODULE.get_prop_number(prop, def));
};

/**
 * @param {string} prop
 * @param {string} def
 */
MODULE.print_prop_string = function (prop, def) {
  MODULE.print_osd(MODULE.get_prop_string(prop, def));
};

/**
 * @param {string} prop
 * @param {string} def
 */
MODULE.print_prop_string_formatted = function (prop, def) {
  MODULE.print_osd(MODULE.get_prop_string_formatted(prop, def));
};

/**
 * @param {string} prop
 * @param {Object.<string, *>|Array.<*>} def
 */
MODULE.print_prop_object = function (prop, def) {
  var obj = this.get_prop_object(prop, def);
  if (util_misc.is_array(obj)) {
    var strings = obj.map(function (item) {
      return JSON.stringify(item);
    });
    MODULE.print_osd(strings.join("\n\n"));
  } else {
    MODULE.print_osd(JSON.stringify(obj));
  }
};

/**
 * @param {string} prop
 * @param {boolean|number|string|Object} def
 */
MODULE.print_prop_autotype = function (prop, def) {
  MODULE.print_osd(MODULE.get_prop_autotype(prop, def));
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
