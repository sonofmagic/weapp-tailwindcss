import type { UserDefinedOptions } from '@/types'
import process from 'node:process'
import { resolveBundlerAppBranch } from '../branches'
import { createNativeGulpFrameworkPlugins } from './frameworks/native'

/**
 * @name weapp-tw-gulp
 * @description Gulp 入口只负责识别 native-gulp 分支，具体 stream 组合由 frameworks/native 拥有。
 * @link https://tw.icebreaker.top/docs/quick-start/frameworks/native
 */
export function createPlugins(options: UserDefinedOptions = {}) {
  const branch = resolveBundlerAppBranch({
    appType: options.appType,
    bundler: 'gulp',
    detectEnv: true,
    env: process.env,
    root: options.tailwindcssBasedir ?? process.cwd(),
    uniAppX: options.uniAppX,
  })
  if (branch.branch !== 'native-gulp') {
    return createNativeGulpFrameworkPlugins({
      ...options,
      appType: options.appType ?? branch.appType,
    })
  }
  return createNativeGulpFrameworkPlugins(options)
}
