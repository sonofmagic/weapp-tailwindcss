import Module from 'node:module'
import process from 'node:process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
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
  return originalLoad.call(this, request, parent, isMain)
}

const taroBin = require.resolve('@tarojs/cli/bin/taro', {
  paths: [process.cwd()],
})

process.argv = [process.execPath, taroBin, ...process.argv.slice(2)]
require(taroBin)
