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

let cachedUniCliPages
let cachedCopyWebpackPluginCompat

function loadUniCliPages() {
  if (!cachedUniCliPages) {
    cachedUniCliPages = originalRequire.call(module, projectRequire.resolve('@dcloudio/uni-cli-shared/lib/pages'))
  }
  return cachedUniCliPages
}

function resolveUniPlatformRuntimePath() {
  const platform = process.env.UNI_PLATFORM
  if (!platform) {
    return undefined
  }
  try {
    return projectRequire.resolve(`@dcloudio/uni-${platform}/dist/index.js`)
  }
  catch {
    try {
      return projectRequire.resolve(`@dcloudio/uni-${platform}`)
    }
    catch {
      return undefined
    }
  }
}

function createCopyWebpackPluginCompat() {
  if (cachedCopyWebpackPluginCompat) {
    return cachedCopyWebpackPluginCompat
  }

  const ActualCopyWebpackPlugin = originalRequire.call(module, projectRequire.resolve('copy-webpack-plugin'))

  class CopyWebpackPluginCompat {
    constructor(options = {}) {
      this.options = options
    }

    apply(compiler) {
      const options = this.options
      const patterns = Array.isArray(options?.patterns) ? options.patterns : []
      if (patterns.length === 0) {
        return
      }
      new ActualCopyWebpackPlugin(options).apply(compiler)
    }
  }

  cachedCopyWebpackPluginCompat = CopyWebpackPluginCompat
  return CopyWebpackPluginCompat
}

function patchUniCliPlatformLikeExports(mod) {
  if (!mod || typeof mod !== 'object') {
    return mod
  }

  if (typeof mod.getPlatformExts === 'function') {
    const originalGetPlatformExts = mod.getPlatformExts.bind(mod)
    mod.getPlatformExts = function patchedGetPlatformExts(...args) {
      const exts = originalGetPlatformExts(...args)
      if (exts && typeof exts === 'object') {
        return exts
      }
      return {
        style: '.wxss',
        template: '.wxml',
        script: '.js',
        filter: '.wxs',
      }
    }
  }

  if (typeof mod.getMPRuntimePath === 'function') {
    const originalGetMPRuntimePath = mod.getMPRuntimePath.bind(mod)
    mod.getMPRuntimePath = function patchedGetMPRuntimePath(...args) {
      try {
        const runtimePath = originalGetMPRuntimePath(...args)
        if (runtimePath) {
          return runtimePath
        }
      }
      catch {
      }

      const fallback = resolveUniPlatformRuntimePath()
      if (fallback) {
        return fallback
      }

      return originalGetMPRuntimePath(...args)
    }
  }

  return mod
}

function patchUniCliSharedExports(sharedModule) {
  if (!sharedModule || typeof sharedModule !== 'object') {
    return sharedModule
  }

  if (typeof sharedModule.getPagesJson !== 'function') {
    try {
      const pages = loadUniCliPages()
      if (typeof pages.getPagesJson === 'function') {
        sharedModule.getPagesJson = pages.getPagesJson
      }
    }
    catch {
    }
  }

  return patchUniCliPlatformLikeExports(sharedModule)
}

function maybePatchDcloudExports(id, loaded) {
  if (id === '@dcloudio/uni-cli-shared' || id === '@dcloudio/uni-cli-shared/lib/util') {
    return patchUniCliSharedExports(loaded)
  }
  if (id === '@dcloudio/uni-cli-shared/lib/platform') {
    return patchUniCliPlatformLikeExports(loaded)
  }
  return loaded
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
  if (id === 'copy-webpack-plugin') {
    return createCopyWebpackPluginCompat()
  }
  if (
    id === '@dcloudio/uni-cli-shared'
    || id === '@dcloudio/uni-cli-shared/lib/util'
    || id === '@dcloudio/uni-cli-shared/lib/platform'
  ) {
    const loaded = originalRequire.call(this, projectRequire.resolve(id))
    return maybePatchDcloudExports(id, loaded)
  }
  if (id === '@dcloudio/uni-cli-i18n') {
    return originalRequire.call(this, projectRequire.resolve(id))
  }
  try {
    return originalRequire.apply(this, [id, ...args])
  }
  catch (error) {
    const moduleNotFound = error && error.code === 'MODULE_NOT_FOUND'
    const missingCurrentId = moduleNotFound && error.message.includes(`'${id}'`)
    if (missingCurrentId && isDcloudRequest(id)) {
      const loaded = originalRequire.call(this, projectRequire.resolve(id))
      return maybePatchDcloudExports(id, loaded)
    }
    throw error
  }
}

require('./patch-ajv-keywords')
require('./patch-chalk')
require('@vue/cli-service/bin/vue-cli-service')
