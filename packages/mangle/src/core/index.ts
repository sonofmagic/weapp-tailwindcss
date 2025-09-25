import type { IMangleOptions, IMangleScopeContext } from '../types'
import { ClassGenerator, defaultMangleClassFilter } from '@tailwindcss-mangle/shared'
import { escapeStringRegexp } from '@weapp-core/regex'
import { splitCode } from '@weapp-tailwindcss/shared/extractors'

function getSelf(x: string) {
  return x
}

export function createMangleContextState(): IMangleScopeContext {
  return {
    rawOptions: false,
    runtimeSet: new Set<string>(),
    runtimePatterns: new Map<string, RegExp>(),
    generatedNameCache: new Map<string, string>(),
    classGenerator: new ClassGenerator(),
    filter: defaultMangleClassFilter,
    cssHandler: getSelf,
    jsHandler: getSelf,
    wxmlHandler: getSelf,
  }
}

export const defaultMangleContext: IMangleScopeContext = createMangleContextState() // as default

export function useMangleStore() {
  const ctx = createMangleContextState()

  function resetMangle() {
    const next = createMangleContextState()
    return Object.assign(ctx, next)
  }

  function handleValue(rawSource: string) {
    let result = rawSource
    const arr = splitCode(rawSource)
    for (const className of arr) {
      if (!ctx.runtimeSet.has(className)) {
        continue
      }

      const pattern = getRuntimePattern(className)
      const replacement = getGeneratedName(className)
      result = result.replace(pattern, replacement)
    }
    return result
  }

  function initMangle(options?: boolean | IMangleOptions) {
    ctx.rawOptions = options

    if (options) {
      if (options === true) {
        options = {
          classGenerator: {},
          mangleClassFilter: defaultMangleClassFilter,
        }
      }
      ctx.classGenerator = new ClassGenerator(options.classGenerator)
      ctx.filter = options.mangleClassFilter ?? defaultMangleClassFilter
      ctx.jsHandler = (rawSource: string) => {
        return handleValue(rawSource)
      }
      ctx.cssHandler = (rawSource: string) => {
        // process 最后处理, loader 无所谓顺序
        return handleValue(rawSource)
      }

      ctx.wxmlHandler = (rawSource: string) => {
        //  splitCode(rawSource)
        return handleValue(rawSource)
      }
    }
  }

  function setMangleRuntimeSet(runtimeSet: Set<string>) {
    const newSet = new Set<string>()
    for (const c of runtimeSet) {
      if (ctx.filter(c)) {
        newSet.add(c)
      }
    }
    ctx.runtimeSet = newSet
    ctx.runtimePatterns = new Map<string, RegExp>()
    for (const className of newSet) {
      ctx.runtimePatterns.set(className, new RegExp(escapeStringRegexp(className), 'g'))
    }
    for (const cached of ctx.generatedNameCache.keys()) {
      if (!newSet.has(cached)) {
        ctx.generatedNameCache.delete(cached)
      }
    }
  }

  function getRuntimePattern(className: string) {
    let pattern = ctx.runtimePatterns.get(className)
    if (!pattern) {
      pattern = new RegExp(escapeStringRegexp(className), 'g')
      ctx.runtimePatterns.set(className, pattern)
    }
    return pattern
  }

  function getGeneratedName(className: string) {
    let replacement = ctx.generatedNameCache.get(className)
    if (!replacement) {
      replacement = ctx.classGenerator.generateClassName(className).name
      ctx.generatedNameCache.set(className, replacement)
    }
    return replacement
  }

  return {
    mangleContext: ctx,
    resetMangle,
    initMangle,
    setMangleRuntimeSet,
  }
}
