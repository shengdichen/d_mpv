var MODULE = {};

/**
 * @param {*} target
 * @returns {boolean}
 */
MODULE.is_num = function (target) {
  return Number(target) === target;
};

/**
 * @param {*} target
 * @returns {boolean}
 */
MODULE.is_int = function (target) {
  return MODULE.is_num(target) && target % 1 === 0;
};

/**
 * @param {*} target
 * @returns {boolean}
 */
MODULE.is_float = function (target) {
  return MODULE.is_num(target) && target % 1 !== 0;
};

/**
 * @param {number} num_1
 * @param {number} num_2
 * @param {number} [precision]
 * @returns {boolean}
 */
MODULE.is_close = function (num_1, num_2, precision) {
  precision = precision !== undefined ? precision : 1e-6;
  return Math.abs(num_1 - num_2) <= precision;
};

/**
 * @param {*} target
 * @returns {boolean}
 */
MODULE.is_object = function (target) {
  return typeof target === "object" && target !== null;
};

/**
 * @param {Object.<*, *>} obj
 * @param {*} key
 */
MODULE.has_member = function (obj, key) {
  return typeof obj[key] !== "undefined";
};

/**
 * @param {Object.<*, *>} [count]
 * @returns {Array.<string>}
 */
MODULE.obj_to_string = function (obj) {
  var kvs = [];
  var s, v;
  for (var k in obj) {
    s = k + ": ";
    v = obj[k];
    if (typeof v === "object") {
      kvs.push(s + JSON.stringify(v));
      continue;
    }
    kvs.push(s + MODULE.format(v));
  }

  return "{ " + kvs.join(", ") + " }";
};

/**
 * @param {*} target
 * @returns {boolean}
 */
MODULE.is_array = function (target) {
  return Array.isArray(target);
};

/**
 * @param {number} num
 * @returns {string}
 */
MODULE.prepend_sign = function (num) {
  if (MODULE.is_close(num, 0)) {
    return "=0";
  }
  if (num > 0) {
    return "+" + num;
  }
  return num;
};

/**
 * @param {number} num
 * @param {number} reference
 * @returns {string}
 */
MODULE.pad_integer_like = function (num, reference) {
  return MODULE.pad_integer(num, MODULE.len_integer(reference));
};

/**
 * @param {number} num
 * @param {number} len
 * @returns {string}
 */
MODULE.pad_integer = function (num, len) {
  var len_num = MODULE.len_integer(num);
  if (len_num >= len) {
    return num;
  }
  return MODULE.repeat("0", len - len_num) + num;
};

/**
 * @param {number} num
 * @returns {number}
 */
MODULE.len_integer = function (num) {
  return num.toString().length;
};

/**
 * @param {number} num
 * @param {number} [n_digits]
 * @returns {string}
 */
MODULE.truncate_after_decimal = function (num, n_digits) {
  n_digits = n_digits || 2;
  var scale = Math.pow(10, n_digits);
  num = Math.round(num * scale) / scale;
  return num.toFixed(n_digits);
};

/**
 * @param {string} str
 * @param {number} [count]
 * @returns {string}
 */
MODULE.repeat = function (str, count) {
  return Array(count + 1).join(str);
};

/**
 * @param {string} str
 * @returns {string}
 */
MODULE.space_like = function (str) {
  return MODULE.repeat(" ", str.length);
};

/**
 * @param {integer} [count]
 * @returns {string}
 */
MODULE.tab = function (count) {
  return MODULE.repeat(" ", (count || 1) * 4);
};

/**
 * @param {Object.<*, *>} [opts]
 * @returns {string}
 */
MODULE.separator = function (opts) {
  var s = "";

  if (opts && "n_linebreaks_before" in opts) {
    s += MODULE.repeat("\n", opts.n_linebreaks_before);
  } else {
    s += "\n";
  }

  s += Array((opts && opts.len) || 37).join((opts && opts.char) || "-");

  if (opts && "n_linebreaks_after" in opts) {
    s += MODULE.repeat("\n", opts.n_linebreaks_after);
  } else {
    s += "\n";
  }

  return s;
};

/**
 * @returns {string}
 */
MODULE.separator_no_linebreaks = function () {
  return MODULE.separator({ n_linebreaks_before: 0, n_linebreaks_after: 0 });
};

/**
 * @param {boolean|number|string} item
 * @returns {string}
 */
MODULE.format = function (item) {
  if (typeof item === "string") {
    return "'" + item + "'";
  }
  if (typeof item === "boolean") {
    if (item) {
      return "T";
    }
    return "F";
  }
  if (MODULE.is_float(item)) {
    return MODULE.truncate_after_decimal(item, 4);
  }
  return item.toString();
};

/**
 * @param {number} duration
 * @returns {string}
 */
MODULE.format_as_time = function (duration) {
  var hours = Math.floor(duration / 3600);

  duration -= hours * 3600;
  var minutes = Math.floor(duration / 60);

  duration -= minutes * 60;
  var seconds = duration.toFixed(3);
  if (duration < 10) {
    seconds = "0" + seconds;
  }

  return hours + ":" + MODULE.pad_integer(minutes, 2) + ":" + seconds;
};

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
MODULE.clamp = function (n, min, max) {
  return Math.min(max, Math.max(min, n));
};

module.exports = {
  export: MODULE,
};
