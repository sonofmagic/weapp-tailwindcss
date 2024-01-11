const path = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, './typography.vue')],
  theme: {
    extend: {},
  },
  // require('./plugin'),
  plugins: [require('./plugin')], // require('@tailwindcss/typography')],
  corePlugins: {
    preflight: false,
  },
};
