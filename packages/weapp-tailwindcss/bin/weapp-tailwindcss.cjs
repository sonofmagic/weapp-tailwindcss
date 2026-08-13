#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')

process.env.npm_package_version ||= require('../package.json').version

const cliPath = path.resolve(__dirname, '../dist/cli.cjs')
if (fs.existsSync(cliPath)) {
  require(cliPath)
}
