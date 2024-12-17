var MODULE = {};

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
    return visual.repeat(" ", (count || 1) * 4);
  },

  /**
   * @param {Object.<*, *>} [opts]
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
   * @returns {string}
   */
  format: function (item) {
    if (typeof item === "string") {
      return "'" + item + "'";
    }
    if (typeof item === "boolean") {
      if (item) {
        return "T";
      }
      return "F";
    }
    if (typing.is_float(item)) {
      return format.truncate_after_decimal(item, 4);
    }
    return item.toString();
  },

  /**
   * @param {Object.<*, *>} [count]
   * @returns {Array.<string>}
   */
  obj_to_string: function (obj) {
    var kvs = [];
    var s, v;
    for (var k in obj) {
      s = k + ": ";
      v = obj[k];
      if (typeof v === "object") {
        kvs.push(s + JSON.stringify(v));
        continue;
      }
      kvs.push(s + format.format(v));
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

    return hours + ":" + format.pad_integer(minutes, 2) + ":" + seconds;
  },

  /**
   * @param {number} num
   * @returns {string}
   */
  prepend_sign: function (num) {
    if (math.is_close(num, 0)) {
      return "=0";
    }
    if (num > 0) {
      return "+" + num;
    }
    return num;
  },

  /**
   * @param {number} num
   * @param {number} reference
   * @returns {string}
   */
  pad_integer_like: function (num, reference) {
    return format.pad_integer(num, format._len_integer(reference));
  },

  /**
   * @param {number} num
   * @param {number} len
   * @returns {string}
   */
  pad_integer: function (num, len) {
    var len_num = format._len_integer(num);
    if (len_num >= len) {
      return num;
    }
    return visual.repeat("0", len - len_num) + num;
  },

  /**
   * @param {number} num
   * @returns {number}
   */
  _len_integer: function (num) {
    return num.toString().length;
  },

  /**
   * @param {number} num
   * @param {number} [n_digits]
   * @returns {string}
   */
  truncate_after_decimal: function (num, n_digits) {
    n_digits = n_digits || 2;
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
};

MODULE.typing = typing;
MODULE.format = format;
MODULE.visual = visual;
MODULE.math = math;

module.exports = {
  export: MODULE,
};
