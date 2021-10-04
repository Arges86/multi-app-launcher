module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: "babel-eslint",
    // specifying a module sourcetype prevent eslint from marking import statements as errors
    sourceType: "module",
    "ecmaFeatures": {
      "legacyDecorators": true
    }
  },
  extends: [
    // use the recommended rule set for both plain javascript and vue
    "eslint:recommended",
    "plugin:vue/recommended"
  ],
  globals: {
    "module": "writable",
    "process": "writable"
  },
  rules: {
    "no-unused-vars": ["warn", {"argsIgnorePattern": "^_" }],
    "require-atomic-updates": "off",
    "indent": ["warn",2],
    "quotes": ["warn","double"],
    "semi": ["warn","always"],
    "spaced-comment": ["warn", "always", {"exceptions": ["-","+"]}],
    "template-curly-spacing": ["off"]
  }
};