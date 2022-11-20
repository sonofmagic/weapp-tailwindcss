#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const cliPath = path.resolve(__dirname, '../dist/cli.js')
if (fs.existsSync(cliPath)) {
  require(cliPath)
}
