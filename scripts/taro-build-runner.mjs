import Module, { createRequire } from 'node:module'
import process from 'node:process'

const require = createRequire(import.meta.url)
const projectRequire = createRequire(`${process.cwd()}/package.json`)
const originalLoad = Module._load
const webpackbarPatched = Symbol.for('weapp-tailwindcss.webpackbar-patched')
const swcDefineConfigFallbackPatched = Symbol.for('weapp-tailwindcss.swc-define-config-fallback-patched')

function isDefineConfigSwcPluginError(error) {
  const message = String(error?.message ?? error ?? '')
  return message.includes('swc_plugin_define_config.wasm')
    && message.includes('PluginCorePkgDiagnostics')
}

function stripDefineConfigSwcPlugin(options) {
  const plugins = options?.jsc?.experimental?.plugins
  if (!Array.isArray(plugins)) {
    return options
  }

  const nextPlugins = plugins.filter((plugin) => {
    const pluginPath = Array.isArray(plugin) ? plugin[0] : plugin
    return !String(pluginPath).includes('swc_plugin_define_config.wasm')
  })

  if (nextPlugins.length === plugins.length) {
    return options
  }

  const experimental = {
    ...options.jsc.experimental,
    plugins: nextPlugins,
  }
  if (nextPlugins.length === 0) {
    delete experimental.plugins
  }

  return {
    ...options,
    jsc: {
      ...options.jsc,
      experimental,
    },
  }
}

function unwrapTaroConfigMacros(code) {
  return code.replace(/\bdefine(?:App|Page)?Config\s*\(/g, '(')
}

function patchSwcCoreDefineConfigFallback(mod) {
  if (!mod || mod[swcDefineConfigFallbackPatched]) {
    return mod
  }

  const originalTransformSync = mod.transformSync
  if (typeof originalTransformSync !== 'function') {
    return mod
  }

  mod.transformSync = function patchedTransformSync(input, optionsOrIsModule, maybeOptions, ...extraArgs) {
    try {
      return originalTransformSync.call(this, input, optionsOrIsModule, maybeOptions, ...extraArgs)
    }
    catch (error) {
      if (!isDefineConfigSwcPluginError(error)) {
        throw error
      }

      const options = typeof optionsOrIsModule === 'object' ? optionsOrIsModule : maybeOptions
      const nextOptions = stripDefineConfigSwcPlugin(options)
      if (nextOptions === options) {
        throw error
      }

      const result = typeof optionsOrIsModule === 'object'
        ? originalTransformSync.call(this, input, nextOptions)
        : originalTransformSync.call(this, input, optionsOrIsModule, nextOptions)

      if (typeof result?.code === 'string') {
        return {
          ...result,
          code: unwrapTaroConfigMacros(result.code),
        }
      }
      return result
    }
  }

  Object.defineProperty(mod, swcDefineConfigFallbackPatched, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })

  return mod
}

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
  if (request === '@swc/core') {
    const swcCore = originalLoad.call(this, request, parent, isMain)
    return patchSwcCoreDefineConfigFallback(swcCore)
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
