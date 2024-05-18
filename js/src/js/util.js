var MODULE = {};

/**
 * @param {number} num
 * @returns {string}
 */
MODULE.prepend_sign = function (num) {
  return (num < 0 ? "" : "+") + num;
};

/**
 * @param {number} num
 * @param {number} reference
 * @returns {string}
 */
MODULE.pad_integer_to = function (num, reference) {
  return this.pad_integer(num, this.len_integer(reference));
};

/**
 * @param {*} num
 * @returns {boolean}
 */
MODULE.is_num = function (num) {
  return Number(num) === num;
};

/**
 * @param {*} num
 * @returns {boolean}
 */
MODULE.is_int = function (num) {
  return this.is_num(num) && num % 1 === 0;
};

/**
 * @param {*} num
 * @returns {boolean}
 */
MODULE.is_float = function (num) {
  return this.is_num(num) && num % 1 !== 0;
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
 * @param {number} [digits]
 * @returns {string}
 */
MODULE.truncate_after_decimal = function (num, digits) {
  return num.toFixed(digits || 2);
};

/**
 * @param {Object.<*, *>} obj
 * @param {*} key
 */
MODULE.has_member = function (obj, key) {
  return typeof obj[key] !== "undefined";
};

module.exports = {
  export: MODULE,
};
