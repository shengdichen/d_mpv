var typing = {
  /**
   * @param {*} target
   * @returns {boolean}
   */
  is_num: function (target) {
    return Number(target) === target;
  },

  /**
   * @param {*} target
   * @returns {boolean}
   */
  is_int: function (target) {
    return typing.is_num(target) && target % 1 === 0;
  },

  /**
   * @param {*} target
   * @returns {boolean}
   */
  is_float: function (target) {
    return typing.is_num(target) && target % 1 !== 0;
  },

  /**
   * @param {*} target
   * @returns {boolean}
   */
  is_object: function (target) {
    return typeof target === "object" && target !== null;
  },

  /**
   * @param {*} target
   * @returns {boolean}
   */
  is_array: function (target) {
    return Array.isArray(target);
  },
};

var visual = {
  /**
   * @param {string} str
   * @param {number} [count]
   * @returns {string}
   */
  repeat: function (str, count) {
    if (count < 1) return "";
    return Array(count + 1).join(str);
  },

  /**
   * @param {string} str
   * @returns {string}
   */
  space_like: function (str) {
    return visual.repeat(" ", str.length);
  },

  /**
   * @param {integer} [count]
   * @returns {string}
   */
  tab: function (count) {
    if (count < 1) return "";
    return visual.repeat(" ", (count || 1) * 4);
  },

  /**
   * @param {Object.<string, *>} [opts]
   * @returns {string}
   */
  separator: function (opts) {
    var s = "";

    if (opts && "n_linebreaks_before" in opts) {
      s += visual.repeat("\n", opts.n_linebreaks_before);
    } else {
      s += "\n";
    }

    s += Array((opts && opts.len) || 37).join((opts && opts.char) || "-");

    if (opts && "n_linebreaks_after" in opts) {
      s += visual.repeat("\n", opts.n_linebreaks_after);
    } else {
      s += "\n";
    }

    return s;
  },

  /**
   * @returns {string}
   */
  separator_no_linebreaks: function () {
    return visual.separator({
      n_linebreaks_before: 0,
      n_linebreaks_after: 0,
    });
  },
};

var format = {
  /**
   * @param {boolean|number|string} item
   * @param {Object.<string, *>} [opts]
   * @returns {string}
   */
  format: function (item, opts) {
    if (typeof item === "string") {
      return format.format_string(item, opts);
    }
    if (typeof item === "boolean") {
      return format.format_boolean(item);
    }
    if (typing.is_float(item)) {
      return format.format_float(item, opts);
    }
    return item.toString();
  },

  /**
   * @param {string} item
   * @param {Object.<string, *>} [opts]
   * @returns {string}
   */
  format_string: function (item, opts) {
    var quote = opts && "quote" in opts ? opts.quote : "single";
    switch (quote) {
      case "double":
        quote = '"';
        break;
      case "back":
        quote = "`";
        break;
      case "single":
        quote = "'";
        break;
    }
    return quote + item + quote;
  },

  /**
   * @param {boolean} item
   * @returns {string}
   */
  format_boolean: function (item) {
    if (item) return "T";
    return "F";
  },

  /**
   * prepend_sign :=
   *    if close to 0: prepend "="
   *    if positive: prepend "+"
   *    if negative: do nothing
   *
   * n_digits_before_decimal := prepend zero iff integer-part requires
   * (strictly) fewer digits; do NOT truncate, i.e., do thing otherwise
   *
   * n_digits_after_decimal := -1 =>
   *    as many digits as needed if divisible,
   *    as many as possible otherwise
   * n_digits_after_decimal := 0 => <int>.
   * n_digits_after_decimal := 1 => <int>.?
   * n_digits_after_decimal := 2 => <int>.??
   *
   * @param {number} item
   * @param {Object.<string, *>} [opts]
   * @returns {string}
   */
  format_float: function (item, opts) {
    var s = "";

    var n_digits_int = math.floor_abs(item).toString().length;
    var n_digits_before_decimal =
      opts && "n_digits_before_decimal" in opts
        ? opts.n_digits_before_decimal
        : 0;
    if (n_digits_before_decimal > n_digits_int) {
      s += visual.repeat("0", n_digits_before_decimal - n_digits_int);
    }

    var n_digits_after_decimal =
      opts && "n_digits_after_decimal" in opts
        ? opts.n_digits_after_decimal
        : -1;
    if (n_digits_after_decimal === -1) {
      s += item.toString();
    } else {
      s += format._truncate_after_decimal(item, n_digits_after_decimal);
    }

    var prepend_sign =
      opts && "prepend_sign" in opts ? opts.prepend_sign : false;
    if (!prepend_sign) {
      return s;
    }

    if (math.is_close(item, 0)) {
      return "=" + s;
    }
    if (item > 0) {
      return "+" + s;
    }
    return s;
  },

  /**
   * @param {Object.<*, *>} [count]
   * @param {Object.<string, *>} [opts]
   * @returns {Array.<string>}
   */
  obj_to_string: function (obj, opts) {
    var kvs = [];
    var s, v;
    for (var k in obj) {
      s = k + ": ";
      v = obj[k];
      if (typeof v === "object") {
        kvs.push(s + JSON.stringify(v));
        continue;
      }
      kvs.push(s + format.format(v, opts));
    }

    return "{ " + kvs.join(", ") + " }";
  },

  /**
   * @param {number} duration
   * @returns {string}
   */
  format_as_time: function (duration) {
    var hours = Math.floor(duration / 3600);

    duration -= hours * 3600;
    var minutes = Math.floor(duration / 60);

    duration -= minutes * 60;
    var seconds = duration.toFixed(3);
    if (duration < 10) {
      seconds = "0" + seconds;
    }

    minutes = format.format_float(minutes, {
      n_digits_before_decimal: 2,
    });
    seconds = format.format_float(seconds, {
      n_digits_before_decimal: 2,
      n_digits_after_decimal: 3,
    });
    return hours + ":" + minutes + ":" + seconds;
  },

  /**
   * @param {number} duration
   * @returns {string}
   */
  format_as_increment: function (incr) {
    if (incr === 1) {
      return "++";
    }
    if (incr === -1) {
      return "--";
    }
    return format.format_float(incr, { prepend_sign: true });
  },

  /**
   * @param {number} avant
   * @param {number} incr
   * @param {number} apres
   * @returns {string}
   */
  format_as_evolution: function (avant, incr, apres) {
    return apres + " <-[" + avant + format.format_as_increment(incr) + "]";
  },

  /**
   * 10/3 becomes:
   *   n_digits < 0 => error
   *   n_digits := 0 => 3.
   *   n_digits := 1 => 3.3
   *   n_digits := 2 => 3.33
   *   ...
   * @param {number} num
   * @param {number} [n_digits]
   * @returns {string}
   */
  _truncate_after_decimal: function (num, n_digits) {
    n_digits = n_digits !== undefined ? n_digits : 2;

    if (n_digits === 0) {
      return Math.round(num) + ".";
    }

    var scale = Math.pow(10, n_digits);
    num = Math.round(num * scale) / scale;
    return num.toFixed(n_digits);
  },
};

var math = {
  /**
   * @param {number} n
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp: function (n, min, max) {
    return Math.min(max, Math.max(min, n));
  },

  /**
   * @param {number} num_1
   * @param {number} num_2
   * @param {number} [precision]
   * @returns {boolean}
   */
  is_close: function (num_1, num_2, precision) {
    precision = precision !== undefined ? precision : 1e-6;
    return Math.abs(num_1 - num_2) <= precision;
  },

  /**
   * implemention of Math.trunc(), not available in mujs
   * @param {number} n
   * @returns {number}
   */
  floor_abs: function (num) {
    if (math.is_close(num, 0)) return 0;
    if (num > 0) return Math.floor(num);
    return -Math.floor(-num);
  },
};

var path = {
  _root: "/",
  _separator: "/",

  /**
   * REF:
   *    https://docs.python.org/3/library/pathlib.html#pathlib.PurePath.parent
   * @param {string} p
   * @returns {string}
   */
  parent: function (p) {
    return p.split(path._separator).slice(0, -1).join(path._separator);
  },

  /**
   * REF:
   *    https://docs.python.org/3/library/pathlib.html#pathlib.PurePath.name
   * @param {string} p
   * @returns {string}
   */
  name: function (p) {
    return p.split(path._separator).slice(-1).toString();
  },

  /**
   * REF:
   *    https://docs.python.org/3/library/pathlib.html#pathlib.PurePath.is_absolute
   * @param {string} p
   * @returns {boolean}
   */
  is_absolute: function (p) {
    return p.substring(0, 1) === path._root;
  },
};

module.exports = {
  typing: typing,
  format: format,
  visual: visual,
  math: math,
  path: path,
};
