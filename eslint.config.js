const { defineConfig } = require("eslint-define-config");
const reactPlugin = require("eslint-plugin-react");
const reactNativePlugin = require("eslint-plugin-react-native");
const babelParser = require("@babel/eslint-parser");

module.exports = defineConfig([
  {
    files: ["**/*.js", "**/*.jsx"], // Files you want to lint
    languageOptions: {
      globals: {
        global: 'readonly',
        require: 'readonly',
        process: 'readonly',
        // Add other global variables here if needed
      },
      parser: babelParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2020,
        sourceType: "module",
        requireConfigFile: false,
      },
      ecmaVersion: 2021,
      sourceType: "module",
    },
    plugins: {
      react: reactPlugin,
      'react-native': reactNativePlugin,
    },
    rules: {
      "react/react-in-jsx-scope": "off", // If using React 17+
      "no-undef": "off", // Temporarily disable to allow for module, global, etc.
      "no-console": "warn", // Example rule
    },
    settings: {
      react: {
        version: 'detect', // Automatically picks the version you have installed
      },
    },
    ignores: [
      'node_modules/', // Example: ignore node_modules
      'dist/',         // Example: ignore dist folder
    ],
  },
]);
