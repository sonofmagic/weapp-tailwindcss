#!/usr/bin/env node
const fs = require('node:fs')
const path = require('node:path')
const process = require('node:process')

function isInstallLifecycle() {
  return process.env.npm_lifecycle_event === 'postinstall' || process.env.npm_lifecycle_event === 'prepare'
}

function isMissingRuntimeModuleError(error) {
  return error && error.code === 'MODULE_NOT_FOUND'
}

const cliPath = path.resolve(__dirname, '../dist/cli.js')
if (fs.existsSync(cliPath)) {
  try {
    require(cliPath)
  }
  catch (error) {
    if (isInstallLifecycle() && isMissingRuntimeModuleError(error)) {
      console.error('[weapp-tailwindcss] install lifecycle patch skipped because a runtime module is missing.')
      console.error('Run `pnpm --filter weapp-tailwindcss build` before strict CLI validation.')
    }
    else {
      throw error
    }
  }
}
