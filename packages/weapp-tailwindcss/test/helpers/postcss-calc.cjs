'use strict'

const { createRequire } = require('node:module')
const path = require('node:path')

const postcssCalcEntry = path.resolve(__dirname, '../../..', 'postcss-calc/src/index.js')
const requireFromPostcssCalc = createRequire(postcssCalcEntry)

module.exports = requireFromPostcssCalc(postcssCalcEntry)
