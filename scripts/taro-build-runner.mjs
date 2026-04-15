import Module, { createRequire } from 'node:module'
import process from 'node:process'

const require = createRequire(import.meta.url)
const projectRequire = createRequire(`${process.cwd()}/package.json`)
const originalLoad = Module._load
const webpackbarPatched = Symbol.for('weapp-tailwindcss.webpackbar-patched')

function createDoctorStub() {
  const validResult = { isValid: true, messages: [] }
  const noop = () => undefined
  const resolveValidResult = async () => validResult

  return {
    __esModule: true,
    default: noop,
    validateConfig: resolveValidResult,
    validateConfigPrint: resolveValidResult,
    validateEnv: noop,
    validateEnvPrint: noop,
    validatePackage: noop,
    validatePackagePrint: noop,
    validateRecommend: noop,
    validateRecommendPrint: noop,
    validateEslint: resolveValidResult,
    validateEslintPrint: async () => true,
  }
}

function patchWebpackbarModule(mod) {
  const WebpackBarPlugin = mod?.default ?? mod
  if (typeof WebpackBarPlugin !== 'function') {
    return mod
  }

  if (WebpackBarPlugin[webpackbarPatched]) {
    return mod
  }

  class PatchedWebpackBarPlugin extends WebpackBarPlugin {
    constructor(options) {
      super(options)
      this.webpackbarOptions = this.options
      this.options = {
        activeModules: true,
        handler: this.handler,
      }
    }

    get state() {
      return this.states[this.webpackbarOptions.name]
    }

    _ensureState() {
      const options = this.webpackbarOptions ?? this.options
      const states = this.states
      if (!states[options.name]) {
        states[options.name] = {
          start: null,
          progress: -1,
          done: false,
          message: '',
          details: [],
          request: null,
          hasErrors: false,
          color: options.color,
          name: options.name.slice(0, 1).toUpperCase() + options.name.slice(1),
        }
      }
    }
  }

  Object.defineProperty(PatchedWebpackBarPlugin, webpackbarPatched, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })

  if (mod?.default) {
    mod.default = PatchedWebpackBarPlugin
    return mod
  }

  return PatchedWebpackBarPlugin
}

// 在 demo 构建里跳过 plugin-doctor，避免其原生模块在当前环境触发 panic。
Module._load = function patchedModuleLoad(request, parent, isMain) {
  if (request === '@tarojs/plugin-doctor') {
    return createDoctorStub()
  }
  if (request === 'webpackbar') {
    const webpackbar = originalLoad.call(this, request, parent, isMain)
    return patchWebpackbarModule(webpackbar)
  }
  if (request === '@tarojs/taro-loader' || request.startsWith('@tarojs/taro-loader/')) {
    const resolvedRequest = projectRequire.resolve(request)
    return originalLoad.call(this, resolvedRequest, parent, isMain)
  }
  return originalLoad.call(this, request, parent, isMain)
}

const taroBin = require.resolve('@tarojs/cli/bin/taro', {
  paths: [process.cwd()],
})

process.argv = [process.execPath, taroBin, ...process.argv.slice(2)]
require(taroBin)
