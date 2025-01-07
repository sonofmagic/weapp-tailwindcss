import type { IMangleScopeContext, UserDefinedOptions } from '../types'
import { ClassGenerator, defaultMangleClassFilter } from '@tailwindcss-mangle/shared'
import { escapeStringRegexp } from '@weapp-core/regex'
import { splitCode } from '../extractors/split'

function getSelf(x: string) {
  return x
}

export const defaultMangleContext: IMangleScopeContext = {
  rawOptions: false,
  runtimeSet: new Set<string>(),
  classGenerator: new ClassGenerator(),
  filter: defaultMangleClassFilter,
  cssHandler: getSelf,
  jsHandler: getSelf,
  wxmlHandler: getSelf,
} // as default

export function useMangleStore() {
  const ctx = Object.assign({}, defaultMangleContext)

  function resetMangle() {
    return Object.assign(ctx, defaultMangleContext)
  }

  function handleValue(rawSource: string) {
    const arr = splitCode(rawSource)
    for (const x of arr) {
      if (ctx.runtimeSet.has(x)) {
        rawSource = rawSource.replace(new RegExp(escapeStringRegexp(x)), ctx.classGenerator.generateClassName(x).name)
      }
    }
    return rawSource
  }

  function initMangle(options: UserDefinedOptions['mangle']) {
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
  }

  return {
    mangleContext: ctx,
    resetMangle,
    initMangle,
    setMangleRuntimeSet,
  }
}
