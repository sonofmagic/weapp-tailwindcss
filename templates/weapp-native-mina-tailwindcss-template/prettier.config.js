const tailwind = require('prettier-plugin-tailwindcss')
/**
 * @type {import('prettier').Config}
 */
module.exports = {
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  arrowParens: 'avoid',
  plugins: [tailwind],
  bracketSameLine: true,
  htmlWhitespaceSensitivity: "ignore",
  overrides: [
    {
      files: '*.wxml',
      options: {
        parser: 'html',
      },
    },
  ],
}
