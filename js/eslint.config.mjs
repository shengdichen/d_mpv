import pluginJs from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      semi: "off",
    },
  },
  {
    name: "js5",
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "commonjs",
    },
  },
  {
    name: "js5/mpv",
    files: ["src/js/util.js"],
    rules: {
      "no-undef": "off", // cater for undefined |mp|
    },
  },
];
