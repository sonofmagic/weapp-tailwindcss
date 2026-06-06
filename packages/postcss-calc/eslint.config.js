const js = require('@eslint/js');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['src/parser.js'],
  },
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      sourceType: 'commonjs',
    },
    rules: {
      curly: 'error',
    },
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        require: 'readonly',
      },
    },
  },
];
