import globals from "globals";
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
      sourceType: "script",
      globals: globals.node,
    },
    rules: {
      "no-undef": "off",
    },
  },
];
