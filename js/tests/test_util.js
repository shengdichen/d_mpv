var util = require("../src/js/util.js");

function assert(target, expected) {
  if (expected === undefined) {
    console.assert(target);
    return;
  }
  if (typeof target === "number") {
    console.assert(target - expected < 1e-6);
    return;
  }
  console.assert(target === expected);
}

function print(...targets) {
  console.log(targets.join(", "));
}

class TestVisual {
  static test_repeat() {
    print("test> visual/repeat");

    assert(util.visual.repeat("z", -1), "");
    assert(util.visual.repeat("z", 0), "");
    assert(util.visual.repeat("z", 3), "zzz");
  }

  static test_tab() {
    print("test> visual/tab");

    assert(util.visual.tab(-1), "");
    assert(util.visual.tab(0), "");

    assert(util.visual.tab(), "    ");
    assert(util.visual.tab(1), "    ");

    assert(util.visual.tab(2), "        ");
  }

  test() {
    TestVisual.test_repeat();
    TestVisual.test_tab();
  }
}

class TestFormat {
  static test_format_boolean() {
    print("test> format/boolean");

    assert(util.format.format_boolean(true), "T");
    assert(util.format.format_boolean(false), "F");
  }

  static test_format_string() {
    print("test> format/string");
    const item = "hello, shc!";

    assert(util.format.format_string(item), "'hello, shc!'");
    assert(
      util.format.format_string(item, { quote: "single" }),
      "'hello, shc!'"
    );
    assert(
      util.format.format_string(item, { quote: "double" }),
      '"hello, shc!"'
    );
    assert(util.format.format_string(item, { quote: "back" }), "`hello, shc!`");
  }

  static test_format_number() {
    print("test> format/float");

    assert(util.format.format_float(42), "42");
    assert(util.format.format_float(-42), "-42");
    assert(util.format.format_float(5 / 2), "2.5");
    assert(util.format.format_float(-5 / 2), "-2.5");
    assert(util.format.format_float(0), "0");

    assert(
      util.format.format_float(41 / 2, { n_digits_before_decimal: 4 }),
      "0020.5"
    );
    assert(
      util.format.format_float(41 / 2, { n_digits_before_decimal: 3 }),
      "020.5"
    );
    assert(
      util.format.format_float(41 / 2, { n_digits_before_decimal: 2 }),
      "20.5"
    );
    assert(
      util.format.format_float(41 / 2, { n_digits_before_decimal: 1 }),
      "20.5"
    );
    assert(
      util.format.format_float(41 / 2, { n_digits_before_decimal: 0 }),
      "20.5"
    );
    assert(
      util.format.format_float(41 / 2, { n_digits_before_decimal: -1 }),
      "20.5"
    );

    assert(util.format.format_float(0, { n_digits_before_decimal: 2 }), "00");
    assert(util.format.format_float(0, { n_digits_before_decimal: 1 }), "0");
    assert(util.format.format_float(0, { n_digits_before_decimal: 0 }), "0");
    assert(util.format.format_float(0, { n_digits_before_decimal: -1 }), "0");

    assert(
      util.format.format_float(10 / 3, { n_digits_after_decimal: 2 }),
      "3.33"
    );
    assert(
      util.format.format_float(10 / 3, { n_digits_after_decimal: 1 }),
      "3.3"
    );
    assert(
      util.format.format_float(10 / 3, { n_digits_after_decimal: 0 }),
      "3."
    );

    assert(
      util.format.format_float(5 / 4, { n_digits_after_decimal: 3 }),
      "1.250"
    );
    assert(
      util.format.format_float(5 / 4, { n_digits_after_decimal: 2 }),
      "1.25"
    );
    assert(
      util.format.format_float(5 / 4, { n_digits_after_decimal: 1 }),
      "1.3"
    );
    assert(
      util.format.format_float(5 / 4, { n_digits_after_decimal: 0 }),
      "1."
    );
    assert(
      util.format.format_float(5 / 4, { n_digits_after_decimal: -1 }),
      "1.25"
    );

    assert(util.format.format_float(10, { prepend_sign: true }), "+10");
    assert(util.format.format_float(10, { prepend_sign: false }), "10");
    assert(util.format.format_float(10), "10");
    assert(util.format.format_float(0, { prepend_sign: true }), "=0");
    assert(util.format.format_float(0, { prepend_sign: false }), "0");
    assert(util.format.format_float(0), "0");
    assert(util.format.format_float(-10, { prepend_sign: true }), "-10");
    assert(util.format.format_float(-10, { prepend_sign: false }), "-10");
    assert(util.format.format_float(-10), "-10");
  }

  static test_format_as_time() {
    print("test> format/as_time");

    assert(util.format.format_as_time(0), "0:00:00.000");
    assert(util.format.format_as_time(99.12345), "0:01:39.123");
    assert(util.format.format_as_time(16384.66667), "4:33:04.667");
  }

  test() {
    TestFormat.test_format_boolean();
    TestFormat.test_format_string();
    TestFormat.test_format_number();
    TestFormat.test_format_as_time();
  }
}

class TestMath {
  static test_floor_abs() {
    print("test> math/floor_abs");

    assert(util.math.floor_abs(100 / 3), 33);
    assert(util.math.floor_abs(1.5), 1);
    assert(util.math.floor_abs(0), 0);
    assert(util.math.floor_abs(-1.5), -1);
    assert(util.math.floor_abs(-100 / 3), -33);
  }

  test() {
    TestMath.test_floor_abs();
  }
}

function main() {
  new TestVisual().test();
  new TestFormat().test();
  new TestMath().test();
}
main();
