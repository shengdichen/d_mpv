module.exports = {
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 5,
    sourceType: "script",
  },
  rules: {
    "no-undef": "off",
  },
};
