#!/usr/bin/env node

const { resolve } = require('path')
const Module = require('module')

const projectRequire = Module.createRequire(resolve(__dirname, '../package.json'))
const babelCoreRequire = Module.createRequire(projectRequire.resolve('@babel/core/package.json'))
const babelParserPath = babelCoreRequire.resolve('@babel/parser')
const originalResolveFilename = Module._resolveFilename
const originalRequire = Module.prototype.require
const isDcloudRequest = request => typeof request === 'string' && request.startsWith('@dcloudio/')
const isDirectModuleNotFound = (error, request) => {
  return Boolean(error && error.code === 'MODULE_NOT_FOUND' && error.message.includes(`'${request}'`))
}

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  if (request === '@babel/parser') {
    return babelParserPath
  }
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options)
  }
  catch (error) {
    if (isDcloudRequest(request) && isDirectModuleNotFound(error, request)) {
      return projectRequire.resolve(request)
    }
    throw error
  }
}

Module.prototype.require = function patchedRequire(id, ...args) {
  if (id === '@babel/parser') {
    return originalRequire.call(this, babelParserPath)
  }
  if (id === '@dcloudio/uni-cli-shared/lib/util' || id === '@dcloudio/uni-cli-i18n') {
    return originalRequire.call(this, projectRequire.resolve(id))
  }
  try {
    return originalRequire.apply(this, [id, ...args])
  }
  catch (error) {
    const moduleNotFound = error && error.code === 'MODULE_NOT_FOUND'
    const missingCurrentId = moduleNotFound && error.message.includes(`'${id}'`)
    if (missingCurrentId && isDcloudRequest(id)) {
      return originalRequire.call(this, projectRequire.resolve(id))
    }
    throw error
  }
}

require('./patch-ajv-keywords')
require('./patch-chalk')
require('@vue/cli-service/bin/vue-cli-service')
