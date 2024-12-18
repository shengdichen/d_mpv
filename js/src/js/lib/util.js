var util = require("../util");

var _MPV = mp; // eslint-disable-line no-undef

var keybind = {
  /**
   * @param {string} key
   * @param {function(): void} fn
   * @param {Object.<string, *>} [opts]
   */
  bind: function (key, fn, opts) {
    if (!opts) {
      _MPV.add_key_binding(key, fn, { repeatable: true });
      return;
    }

    opts.repeatable = "repeatable" in opts ? opts.repeatable : true;

    if (opts.force) {
      delete opts.force;
      _MPV.add_forced_key_binding(key, fn, opts);
      return;
    }
    _MPV.add_key_binding(key, fn, opts);
  },
};

var exec = {
  /**
   * @param {Array.<string>|string} fragments
   */
  run: function (fragments) {
    if (!Array.isArray(fragments)) {
      exec.run_string(fragments);
      return;
    }

    exec.run_array(fragments);
  },

  /**
   * @param {string} cmd
   */
  run_string: function (cmd) {
    // REF:
    //  https://mpv.io/manual/master/#lua-scripting-mp-command(string)
    _MPV.command(cmd);
  },

  /**
   * @param {Array.<string>} fragments
   */
  run_array: function (fragments) {
    // REF:
    //  https://mpv.io/manual/master/#lua-scripting-)
    _MPV.commandv.apply(null, fragments); // no spread-syntax in mujs

    // NOTE:
    // the tempting alternative:
    //  _MPV.command_native(fragments);
    // forwards non-string types in <fragments> (e.g., boolean) erroneously
    // REF:
    //  https://mpv.io/manual/master/#lua-scripting-mp-command-native(table-[,def])
  },

  /**
   * evoke <callback> declared in <script>{.lua, .js} with
   *    mp.add_key_binding(nil, <bind>, <callback>)
   * no args forwarded, i.e., (<script>, <bind>) is an alias for <callback>
   * @param {string} script
   * @param {string} bind
   */
  run_script_bind: function (script, bind) {
    // REF:
    //  https://mpv.io/manual/master/#command-interface-script-binding
    exec.run_array(["script-binding", script + "/" + bind]);
  },

  /**
   * evoke <callback> declared in ANY script with
   *    mp.register_script_message(<fn>, <callback>)
   * forwarding <args>, i.e., <fn> is an alias for <callback>
   * @param {string} fn
   * @param {Array.<*>} args
   */
  run_script_fn: function (fn, args) {
    exec.run_array(["script-message", fn].concat(args));
  },
};

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
    _MPV.options.read_options(map, script);
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
   * @returns {boolean|undefined}
   */
  get_boolean: function (prop, def) {
    return _MPV.get_property_bool(prop, def);
  },

  /**
   * @param {string} prop
   * @param {boolean} val
   */
  set_boolean: function (prop, val) {
    return _MPV.set_property_bool(prop, val);
  },

  /**
   * @param {string} prop
   * @param {number} def
   * @returns {number|undefined}
   */
  get_number: function (prop, def) {
    return _MPV.get_property_number(prop, def);
  },

  /**
   * @param {string} prop
   * @param {number} val
   */
  set_number: function (prop, val) {
    return _MPV.set_property_number(prop, val);
  },

  /**
   * @param {string} prop
   * @param {string} def
   * @returns {string|undefined}
   */
  get_string: function (prop, def) {
    return _MPV.get_property(prop, def);
  },

  /**
   * @param {string} prop
   * @param {string} val
   */
  set_string: function (prop, val) {
    return _MPV.set_property(prop, val);
  },

  /**
   * get property, but (type-)converted by mpv's default (useful if type of
   * property is not constant, e.g., can be both boolean or string)
   * @param {string} prop
   * @param {boolean|number|string|Object} def
   * @returns {boolean|number|string|Object|undefined}
   */
  get_autotype: function (prop, def) {
    return _MPV.get_property_native(prop, def);
  },

  /**
   * @param {string} prop
   * @param {boolean|number|string|Object} val
   */
  set_autotype: function (prop, val) {
    return _MPV.set_property_native(prop, val);
  },

  /**
   * get property as object, but converted to object with |\_prop| as key if not
   * an object by default, i.e., boolean or number or string
   * @param {string} prop
   * @param {Object} def
   * @returns {Object.<string, *>|Array.<*>}
   */
  get_object: function (prop, def) {
    var res = _MPV.get_property_native(prop, def);
    if (util.typing.is_object(res)) {
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
    return _MPV.get_property_osd(prop, def);
  },
};

var osd = {
  /**
   * @param {string} text
   * @param {number} [duration]
   */
  print: function (text, duration) {
    _MPV.osd_message(text, duration || 0.7);
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
    if (!util.typing.is_array(obj)) {
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

module.exports = {
  raw: _MPV,
  keybind: keybind,
  exec: exec,
  property: property,
  osd: osd,
};
