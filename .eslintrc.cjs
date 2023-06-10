/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['icebreaker', 'plugin:prettier/recommended'],
  rules: {
    'unicorn/no-array-reduce': 0,
    'unicorn/no-object-as-default-parameter': 0,
    'unicorn/filename-case': 0,
    'unicorn/no-null': 0,
    'unicorn/prefer-module': 0,
    'unicorn/prefer-top-level-await': 0
  }
}
