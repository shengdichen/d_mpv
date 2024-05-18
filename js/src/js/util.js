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
  return this.is_num(target) && target % 1 === 0;
};

/**
 * @param {*} target
 * @returns {boolean}
 */
MODULE.is_float = function (target) {
  return this.is_num(target) && target % 1 !== 0;
};

/**
 * @param {*} target
 * @returns {boolean}
 */
MODULE.is_object = function (target) {
  return typeof target === "object" && target !== null;
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
