const expoConfig = require("eslint-config-expo/flat");

module.exports = [
  ...expoConfig,
  {
    ignores: [
      ".agents/**",
      ".expo/**",
      "coverage/**",
      "docs/plans/**",
      "node_modules/**",
      "src/api/generated/**"
    ],
  },
  {
    files: ["app/_layout.tsx"],
    rules: {
      "import/no-duplicates": "off",
    },
  },
  {
    files: ["jest.setup.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
