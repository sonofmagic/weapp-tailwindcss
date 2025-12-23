/**
 * @type {import('postcss').AcceptedPlugin[]}
 */
const plugins = [require('tailwindcss')(), require('autoprefixer')()]

plugins.push(require('weapp-tailwindcss/css-macro/postcss'))

module.exports = plugins
