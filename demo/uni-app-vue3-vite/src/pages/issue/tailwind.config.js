const path = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, './typography.vue'), path.resolve(__dirname, './typography.js')],
  theme: {
    extend: {},
  },
  // require('./plugin'),
  plugins: [require('@weapp-tailwindcss/typography')], // [require('./plugin')], // require('@tailwindcss/typography')],
  corePlugins: {
    preflight: false,
  },
};
