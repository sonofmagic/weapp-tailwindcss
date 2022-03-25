const tailwind = require('prettier-plugin-tailwindcss')

module.exports = {
  semi: false,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 120,
  tabWidth: 2,
  arrowParens: 'avoid',
  plugins: [tailwind],
  overrides: [
    {
      files: '*.wxml',
      options: {
        parser: 'html',
      },
    },
  ],
}
