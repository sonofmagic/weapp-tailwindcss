import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from './types'
import { getCompilerContext } from '@/context'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'

/**
 * 创建一个上下文对象，用于处理小程序的模板、样式和脚本转换。
 * @param options - 用户定义的选项对象
 * @returns 返回一个包含 transformWxss、transformWxml 和 transformJs 方法的对象
 */
export function createContext(options: UserDefinedOptions = {}) {
  const opts = getCompilerContext(options)
  const { templateHandler, styleHandler, jsHandler, twPatcher } = opts

  let runtimeSet = new Set<string>()
  twPatcher.patch()

  function transformWxss(rawCss: string, options?: Partial<IStyleHandlerOptions>) {
    return styleHandler(rawCss, defuOverrideArray(options!, {
      isMainChunk: true,
    }))
  }

  async function transformJs(rawJs: string, options: { runtimeSet?: Set<string> } & CreateJsHandlerOptions = {}) {
    runtimeSet
      = options && options.runtimeSet
        ? options.runtimeSet
        : await twPatcher.getClassSet()

    return await jsHandler(rawJs, runtimeSet, options)
  }

  function transformWxml(rawWxml: string, options?: ITemplateHandlerOptions) {
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
