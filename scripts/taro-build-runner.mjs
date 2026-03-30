import Module, { createRequire } from 'node:module'
import process from 'node:process'

const require = createRequire(import.meta.url)
const projectRequire = createRequire(`${process.cwd()}/package.json`)
const originalLoad = Module._load

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

// 在 demo 构建里跳过 plugin-doctor，避免其原生模块在当前环境触发 panic。
Module._load = function patchedModuleLoad(request, parent, isMain) {
  if (request === '@tarojs/plugin-doctor') {
    return createDoctorStub()
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
