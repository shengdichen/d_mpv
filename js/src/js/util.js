var MODULE = {};

MODULE.prepend_sign = function (num) {
  return (num < 0 ? "" : "+") + num;
};

MODULE.pad_integer_to = function (num, reference) {
  return this.pad_integer(num, this.len_integer(reference));
};

MODULE.is_num = function (num) {
  return Number(num) === num;
};

MODULE.is_int = function (num) {
  return this.is_num(num) && num % 1 === 0;
};

MODULE.is_float = function (num) {
  return this.is_num(num) && num % 1 !== 0;
};

MODULE.pad_integer = function (num, len) {
  num = num.toString();
  while (num.length < len) {
    num = "0" + num;
  }
  return num;
};

MODULE.len_integer = function (num) {
  return num.toString().length;
};

MODULE.truncate_after_decimal = function (num, digits) {
  if (!digits) {
    digits = 2;
  }
  return num.toFixed(digits);
};

module.exports = {
  util: MODULE,
};
