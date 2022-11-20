#!/usr/bin/env node
const fs = require('fs')
const cliPath = '../dist/cli.js'
if (fs.existsSync(cliPath)) {
  require(cliPath)
}
