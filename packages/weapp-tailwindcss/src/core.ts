import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from './types'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { getCompilerContext } from '@/context'
import { collectRuntimeClassSet, createTailwindPatchPromise } from '@/tailwindcss/runtime'

/**
 * 创建一个上下文对象，用于处理小程序的模板、样式和脚本转换。
 * @param options - 用户定义的选项对象
 * @returns 返回一个包含 transformWxss、transformWxml 和 transformJs 方法的对象
 */
export function createContext(options: UserDefinedOptions = {}) {
  const opts = getCompilerContext(options)
  const { templateHandler, styleHandler, jsHandler, twPatcher } = opts

  let runtimeSet = new Set<string>()
  const patchPromise = createTailwindPatchPromise(twPatcher)

  async function transformWxss(rawCss: string, options?: Partial<IStyleHandlerOptions>) {
    await patchPromise
    const result = await styleHandler(rawCss, defuOverrideArray(options!, {
      isMainChunk: true,
    }))
    runtimeSet = await collectRuntimeClassSet(twPatcher, { force: true })
    return result
  }

  async function transformJs(rawJs: string, options: { runtimeSet?: Set<string> } & CreateJsHandlerOptions = {}) {
    await patchPromise
    runtimeSet
      = options && options.runtimeSet
        ? options.runtimeSet
        : await collectRuntimeClassSet(twPatcher, { force: true })

    return await jsHandler(rawJs, runtimeSet, options)
  }

  async function transformWxml(rawWxml: string, options?: ITemplateHandlerOptions) {
    await patchPromise
    if (!options?.runtimeSet && runtimeSet.size === 0) {
      runtimeSet = await collectRuntimeClassSet(twPatcher, { force: true })
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
