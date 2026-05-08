/**
 * @type {import('postcss').AcceptedPlugin[]}
 */
const plugins = process.env.WEAPP_TW_GENERATOR_MODE === 'legacy'
  ? [require('tailwindcss')(), require('autoprefixer')()]
  : [require('autoprefixer')()]

plugins.push(require('weapp-tailwindcss/css-macro/postcss'))

module.exports = plugins
