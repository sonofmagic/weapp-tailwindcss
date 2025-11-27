import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from './types'
import process from 'node:process'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { getCompilerContext } from '@/context'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { collectRuntimeClassSet, refreshTailwindRuntimeState } from '@/tailwindcss/runtime'

/**
 * 创建一个上下文对象，用于处理小程序的模板、样式和脚本转换。
 * @param options - 用户定义的选项对象
 * @returns 返回一个包含 transformWxss、transformWxml 和 transformJs 方法的对象
 */
export function createContext(options: UserDefinedOptions = {}) {
  const opts = getCompilerContext(options)
  const { templateHandler, styleHandler, jsHandler, twPatcher: initialTwPatcher, refreshTailwindcssPatcher } = opts

  const patchRecorderState = setupPatchRecorder(initialTwPatcher, opts.tailwindcssBasedir, {
    source: 'runtime',
    cwd: opts.tailwindcssBasedir ?? process.cwd(),
  })

  let runtimeSet = new Set<string>()
  const runtimeState = {
    twPatcher: initialTwPatcher,
    patchPromise: patchRecorderState.patchPromise,
    refreshTailwindcssPatcher,
    onPatchCompleted: patchRecorderState.onPatchCompleted,
  }

  async function refreshRuntimeState(force: boolean) {
    await refreshTailwindRuntimeState(runtimeState, force)
  }

  async function transformWxss(rawCss: string, options?: Partial<IStyleHandlerOptions>) {
    await runtimeState.patchPromise
    const result = await styleHandler(rawCss, defuOverrideArray(options!, {
      isMainChunk: true,
    }))
    await refreshRuntimeState(true)
    await runtimeState.patchPromise
    runtimeSet = await collectRuntimeClassSet(runtimeState.twPatcher, { force: true, skipRefresh: true })
    return result
  }

  async function transformJs(rawJs: string, options: { runtimeSet?: Set<string> } & CreateJsHandlerOptions = {}) {
    await runtimeState.patchPromise
    if (options?.runtimeSet) {
      runtimeSet = options.runtimeSet
    }
    else {
      await refreshRuntimeState(true)
      await runtimeState.patchPromise
      runtimeSet = await collectRuntimeClassSet(runtimeState.twPatcher, { force: true, skipRefresh: true })
    }
    return await jsHandler(rawJs, runtimeSet, options)
  }

  async function transformWxml(rawWxml: string, options?: ITemplateHandlerOptions) {
    await runtimeState.patchPromise
    if (!options?.runtimeSet && runtimeSet.size === 0) {
      await refreshRuntimeState(true)
      await runtimeState.patchPromise
      runtimeSet = await collectRuntimeClassSet(runtimeState.twPatcher, { force: true, skipRefresh: true })
    }
    return templateHandler(rawWxml, defuOverrideArray(options!, {
      runtimeSet,
    }))
  }

  return {
    transformWxss,
    transformWxml,
    transformJs,
  }
}
