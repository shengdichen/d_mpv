var util_misc = require("../util");

var MODULE = {};

var _mpv = mp; // eslint-disable-line no-undef
MODULE.raw = _mpv;

var keybind = {
  /**
   * @param {string} key
   * @param {function(): void} fn
   * @param {Object.<string, *>} [opts]
   */
  bind: function (key, fn, opts) {
    if (!opts) {
      _mpv.add_key_binding(key, fn, { repeatable: true });
      return;
    }

    opts.repeatable = "repeatable" in opts ? opts.repeatable : true;

    if (opts.force) {
      delete opts.force;
      _mpv.add_forced_key_binding(key, fn, opts);
      return;
    }
    _mpv.add_key_binding(key, fn, opts);
  },
};
MODULE.keybind = keybind;

var exec = {
  /**
   * @param {Array.<string>|string} fragments
   */
  run: function (fragments) {
    if (!Array.isArray(fragments)) {
      _mpv.command(fragments);
      return;
    }
    _mpv.commandv.apply(null, fragments);
  },

  /**
   * @param {string} script
   * @param {string} bind
   */
  run_script_bind: function (script, bind) {
    // REF:
    //  https://mpv.io/manual/master/#command-interface-script-binding
    exec.run(["script-binding", script + "/" + bind]);
  },

  /**
   * @param {string} fn
   * @param {Array.<string>} args
   */
  run_script_fn: function (fn, args) {
    exec.run(["script-message", fn].concat(args));
  },
};
MODULE.exec = exec;

var property = {
  /**
   * @param {string} item
   * @param {Array.<*>} [values]
   */
  cycle: function (item, values) {
    if (!values) {
      exec.run(["cycle", item]);
      return;
    }
    exec.run(["cycle-values", item].concat(values));
  },

  /**
   * for every (key, val) in map, query key's config-value from script, using val as default
   * NOTE: consider get_prop_script() when querying one single key for cleaner syntax
   * @param {string} script
   * @param {Object.<string, *>} map
   * @returns {Object.<string, *>}
   */
  get_prop_script_multi: function (script, map) {
    _mpv.options.read_options(map, script);
    return map;
  },

  /**
   * query one single prop from script; a special case of get_prop_script_multi()
   * @param {string} script
   * @param {string} prop
   * @param {*} def
   * @returns {*}
   */
  get_prop_script: function (script, prop, def) {
    var res = {};
    res[prop] = def || "__NONE";
    return property.get_prop_script_multi(script, res)[prop];
  },

  /**
   * @param {string} prop
   * @param {boolean} def
   * @returns {boolean}
   */
  get_boolean: function (prop, def) {
    return _mpv.get_property_bool(prop, def);
  },

  /**
   * @param {string} prop
   * @param {boolean} val
   */
  set_boolean: function (prop, val) {
    return _mpv.set_property_bool(prop, val);
  },

  /**
   * @param {string} prop
   * @param {number} def
   * @returns {number}
   */
  get_number: function (prop, def) {
    return _mpv.get_property_number(prop, def);
  },

  /**
   * @param {string} prop
   * @param {number} val
   */
  set_number: function (prop, val) {
    return _mpv.set_property_number(prop, val);
  },

  /**
   * @param {string} prop
   * @param {string} def
   * @returns {string}
   */
  get_string: function (prop, def) {
    return _mpv.get_property(prop, def);
  },

  /**
   * @param {string} prop
   * @param {string} val
   */
  set_string: function (prop, val) {
    return _mpv.set_property(prop, val);
  },

  /**
   * get property, but (type-)converted by mpv's default (useful if type of
   * property is not constant, e.g., can be both boolean or string)
   * @param {string} prop
   * @param {boolean|number|string|Object} def
   * @returns {boolean|number|string|Object}
   */
  get_autotype: function (prop, def) {
    return _mpv.get_property_native(prop, def);
  },

  /**
   * @param {string} prop
   * @param {boolean|number|string|Object} val
   */
  set_autotype: function (prop, val) {
    return _mpv.set_property_native(prop, val);
  },

  /**
   * get property as object, but converted to object with |\_prop| as key if not
   * an object by default, i.e., boolean or number or string
   * @param {string} prop
   * @param {Object} def
   * @returns {Object.<string, *>|Array.<*>}
   */
  get_object: function (prop, def) {
    var res = _mpv.get_property_native(prop, def);
    if (util_misc.typing.is_object(res)) {
      return res;
    }
    return { _prop: res };
  },

  /**
   * get property as string, but formatted by mpv's default
   * @param {string} prop
   * @param {string} def
   * @returns {string}
   */
  get_string_formatted: function (prop, def) {
    return _mpv.get_property_osd(prop, def);
  },
};
MODULE.property = property;

var osd = {
  /**
   * @param {string} text
   * @param {number} [duration]
   */
  print: function (text, duration) {
    _mpv.osd_message(text, duration || 0.7);
  },

  /**
   * @param {string} prop
   * @param {boolean} def
   */
  print_prop_boolean: function (prop, def) {
    osd.print(property.get_boolean(prop, def));
  },

  /**
   * @param {string} prop
   * @param {number} def
   */
  print_prop_number: function (prop, def) {
    osd.print(property.get_number(prop, def));
  },

  /**
   * @param {string} prop
   * @param {string} def
   */
  print_prop_string: function (prop, def) {
    osd.print(property.get_string(prop, def));
  },

  /**
   * @param {string} prop
   * @param {boolean|number|string|Object} def
   */
  print_prop_autotype: function (prop, def) {
    osd.print(property.get_autotype(prop, def));
  },

  /**
   * @param {string} prop
   * @param {Object.<string, *>|Array.<*>} def
   */
  print_prop_object: function (prop, def) {
    var obj = property.get_object(prop, def);
    if (!util_misc.typing.is_array(obj)) {
      osd.print(JSON.stringify(obj));
      return;
    }
    var strings = obj.map(function (i) {
      return JSON.stringify(i);
    });
    osd.print(strings.join("\n\n"));
  },

  /**
   * @param {string} prop
   * @param {string} def
   */
  print_prop_string_formatted: function (prop, def) {
    osd.print(property.get_string_formatted(prop, def));
  },
};
MODULE.osd = osd;

module.exports = {
  export: MODULE,
};
