#!/usr/bin/env node

const { resolve } = require('path')
const Module = require('module')

const uniCliSharedUtil = resolve(__dirname, '../node_modules/@dcloudio/uni-cli-shared/lib/util.js')
const originalRequire = Module.prototype.require
Module.prototype.require = function patchedRequire(id, ...args) {
  if (id === '@dcloudio/uni-cli-shared/lib/util') {
    return originalRequire.call(this, uniCliSharedUtil)
  }
  return originalRequire.apply(this, [id, ...args])
}

require('./patch-ajv-keywords')
require('./patch-chalk')
require('@vue/cli-service/bin/vue-cli-service')
