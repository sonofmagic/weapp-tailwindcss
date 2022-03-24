const tailwind = require('prettier-plugin-tailwindcss')

const combinedFormatter = {
  ...tailwind,
  parsers: {
    ...tailwind.parsers,
    wxml: tailwind.parsers.html,
  },
}
module.exports = {
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  arrowParens: 'avoid',
  plugins: [combinedFormatter],
  overrides: [
    {
      files: '*.wxml',
      options: {
        parser: 'html',
      },
    },
  ],
}
