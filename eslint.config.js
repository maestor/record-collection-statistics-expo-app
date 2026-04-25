const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      "func-style": ["error", "expression", { allowArrowFunctions: true }],
    },
  },
  {
    ignores: ["dist/*"],
  },
  {
    ignores: [".agents/**", ".expo/**", "coverage/**"],
  },
]);
