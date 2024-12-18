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
    name: "src",
    files: ["src/**/*.js"],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: "commonjs",
    },
  },
  {
    name: "test",
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];
