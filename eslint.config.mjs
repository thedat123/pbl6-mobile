import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import babelEslint from "@babel/eslint-parser"; // Import the Babel parser

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parser: babelEslint, // Use the Babel parser
      parserOptions: {
        requireConfigFile: false, // Allows you to use the parser without a Babel config file
        ecmaVersion: 2020, // You can set this to whatever ECMAScript version you are using
        sourceType: "module", // Allows the use of ES modules
      },
    },
    plugins: {
      react: pluginReact,
    },
    rules: {
      // Add any specific rules or overrides you want here.
    },
  },
  // Recommended rules from ESLint and the React plugin
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  // Ignore certain directories
  {
    ignores: [
      ".expo/**",
      "node_modules/**",
    ],
  },
];
