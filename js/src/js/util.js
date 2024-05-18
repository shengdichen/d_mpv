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
  var sign = "";
  if (MODULE.is_close(num, 0)) {
    sign = "=";
  } else if (num > 0) {
    sign = "+";
  }
  return sign + num;
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
  num = num.toString();
  while (num.length < len) {
    num = "0" + num;
  }
  return num;
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

module.exports = {
  export: MODULE,
};
