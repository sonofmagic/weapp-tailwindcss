const path = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, './typography.vue')],
  plugins: [require('@weapp-tailwindcss/typography')],
  corePlugins: {
    preflight: false,
  },
};
