import type { CreateJsHandlerOptions, IStyleHandlerOptions, ITemplateHandlerOptions, UserDefinedOptions } from './types'
import process from 'node:process'
import { defuOverrideArray } from '@weapp-tailwindcss/shared'
import { getCompilerContext } from '@/context'
import { setupPatchRecorder } from '@/tailwindcss/recorder'
import { ensureRuntimeClassSet } from '@/tailwindcss/runtime'

type RuntimeJsTransformOptions = { runtimeSet?: Set<string> } & CreateJsHandlerOptions

const DEFAULT_MAIN_CHUNK_STYLE_OPTIONS = Object.freeze({
  isMainChunk: true,
}) satisfies Readonly<Partial<IStyleHandlerOptions>>

function resolveTransformWxssOptions(options?: Partial<IStyleHandlerOptions>) {
  if (!options) {
    return DEFAULT_MAIN_CHUNK_STYLE_OPTIONS
  }

  if (options.isMainChunk === true) {
    return options
  }

  return defuOverrideArray(options, DEFAULT_MAIN_CHUNK_STYLE_OPTIONS)
}

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
  const defaultJsHandlerOptionsCache = new Map<number, CreateJsHandlerOptions>()

  function getDefaultJsHandlerOptions(majorVersion = runtimeState.twPatcher.majorVersion) {
    if (typeof majorVersion !== 'number') {
      return undefined
    }

    let cached = defaultJsHandlerOptionsCache.get(majorVersion)
    if (!cached) {
      cached = {
        tailwindcssMajorVersion: majorVersion,
      }
      defaultJsHandlerOptionsCache.set(majorVersion, cached)
    }
    return cached
  }

  function withRuntimeTailwindMajorVersion(options?: CreateJsHandlerOptions) {
    if (!options) {
      return getDefaultJsHandlerOptions()
    }

    if (typeof options.tailwindcssMajorVersion === 'number') {
      return options
    }

    const majorVersion = runtimeState.twPatcher.majorVersion
    if (typeof majorVersion !== 'number') {
      return options
    }

    return {
      ...options,
      tailwindcssMajorVersion: majorVersion,
    }
  }

  function resolveTransformJsOptions(options?: RuntimeJsTransformOptions): CreateJsHandlerOptions | undefined {
    if (!options) {
      return getDefaultJsHandlerOptions()
    }

    let hasHandlerOption = false
    let runtimeSetProvided = false
    for (const key in options) {
      if (key === 'runtimeSet') {
        runtimeSetProvided = true
        continue
      }
      hasHandlerOption = true
      break
    }

    if (!hasHandlerOption) {
      return getDefaultJsHandlerOptions()
    }

    if (!runtimeSetProvided && typeof options.tailwindcssMajorVersion === 'number') {
      return options
    }

    if (runtimeSetProvided) {
      const { runtimeSet: _runtimeSet, ...handlerOptions } = options
      return withRuntimeTailwindMajorVersion(handlerOptions)
    }

    return withRuntimeTailwindMajorVersion(options)
  }

  const runtimeAwareTemplateJsHandler = (
    source: string,
    runtime?: Set<string>,
    handlerOptions?: CreateJsHandlerOptions,
  ) => {
    return jsHandler(source, runtime, withRuntimeTailwindMajorVersion(handlerOptions))
  }
  let cachedDefaultTemplateHandlerOptions: ITemplateHandlerOptions | undefined
  let cachedDefaultTemplateRuntimeSet: Set<string> | undefined
  let cachedRuntimeOnlyTemplateHandlerOptions: ITemplateHandlerOptions | undefined
  let cachedRuntimeOnlyTemplateRuntimeSet: Set<string> | undefined

  function getDefaultTemplateHandlerOptions() {
    if (cachedDefaultTemplateRuntimeSet !== runtimeSet || !cachedDefaultTemplateHandlerOptions) {
      cachedDefaultTemplateRuntimeSet = runtimeSet
      cachedDefaultTemplateHandlerOptions = {
        runtimeSet,
        jsHandler: runtimeAwareTemplateJsHandler,
      }
    }
    return cachedDefaultTemplateHandlerOptions
  }

  function resolveTransformWxmlOptions(options?: ITemplateHandlerOptions) {
    if (!options) {
      return getDefaultTemplateHandlerOptions()
    }

    let hasOverride = false
    for (const key in options) {
      if (key !== 'runtimeSet') {
        hasOverride = true
        break
      }
    }

    if (!hasOverride) {
      const runtimeOverride = options.runtimeSet
      if (runtimeOverride === undefined || runtimeOverride === runtimeSet) {
        return getDefaultTemplateHandlerOptions()
      }

      if (cachedRuntimeOnlyTemplateRuntimeSet !== runtimeOverride || !cachedRuntimeOnlyTemplateHandlerOptions) {
        cachedRuntimeOnlyTemplateRuntimeSet = runtimeOverride
        cachedRuntimeOnlyTemplateHandlerOptions = {
          runtimeSet: runtimeOverride,
          jsHandler: runtimeAwareTemplateJsHandler,
        }
      }
      return cachedRuntimeOnlyTemplateHandlerOptions
    }

    return defuOverrideArray(options, {
      runtimeSet,
      jsHandler: runtimeAwareTemplateJsHandler,
    })
  }

  async function transformWxss(rawCss: string, options?: Partial<IStyleHandlerOptions>) {
    await runtimeState.patchPromise
    const result = await styleHandler(rawCss, resolveTransformWxssOptions(options))
    runtimeSet = await ensureRuntimeClassSet(runtimeState, {
      forceRefresh: true,
      forceCollect: true,
    })
    return result
  }

  async function transformJs(rawJs: string, options?: RuntimeJsTransformOptions) {
    await runtimeState.patchPromise
    if (options?.runtimeSet) {
      runtimeSet = options.runtimeSet
    }
    else if (runtimeSet.size === 0) {
      runtimeSet = await ensureRuntimeClassSet(runtimeState, {
        forceCollect: true,
      })
    }
    return await jsHandler(rawJs, runtimeSet, resolveTransformJsOptions(options))
  }

  async function transformWxml(rawWxml: string, options?: ITemplateHandlerOptions) {
    await runtimeState.patchPromise
    if (!options?.runtimeSet && runtimeSet.size === 0) {
      runtimeSet = await ensureRuntimeClassSet(runtimeState, {
        forceCollect: true,
      })
    }
    return templateHandler(rawWxml, resolveTransformWxmlOptions(options))
  }

  return {
    transformWxss,
    transformWxml,
    transformJs,
  }
}
