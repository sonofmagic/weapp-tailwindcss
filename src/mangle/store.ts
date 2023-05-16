import { ClassGenerator, defaultMangleClassFilter } from 'tailwindcss-mangle-shared'
import { UserDefinedOptions } from '@/types'
import { splitCode } from '@/extractors/split'
import { escapeStringRegexp } from '@/reg'

function getSelf(x: string) {
  return x
}

const defaultScope = {
  rawOptions: false,
  runtimeSet: new Set<string>(),
  classGenerator: new ClassGenerator(),
  cssHandler: getSelf,
  jsHandler: getSelf,
  wxmlHandler: getSelf,
  recorder: {
    js: [],
    css: [],
    wxml: []
  }
} // as default
// import type { BabelFileResult } from '@babel/core'
// 为什么要用这种方式，因为一层一层往下传递参数，太烦了
// 所以说还是搞个 IOC 容器比较爽，要什么注入什么
const scope: {
  rawOptions: UserDefinedOptions['mangle']
  runtimeSet: Set<string>
  classGenerator: ClassGenerator
  cssHandler: (rawSource: string) => string //  typeof cssHandler
  jsHandler: (rawSource: string) => string // typeof jsHandler
  wxmlHandler: (rawSource: string) => string
  recorder: {
    js: string[]
    css: string[]
    wxml: string[]
  }
} = Object.assign({}, defaultScope)

export function useStore() {
  return scope
}

export function resetStore() {
  return Object.assign(scope, defaultScope)
}

export function initStore(options: UserDefinedOptions['mangle']) {
  scope.rawOptions = options

  function handleValue(rawSource: string) {
    const arr = splitCode(rawSource)
    for (let i = 0; i < arr.length; i++) {
      const x = arr[i]
      if (scope.runtimeSet.has(x)) {
        rawSource = rawSource.replace(new RegExp(escapeStringRegexp(x), 'g'), scope.classGenerator.generateClassName(x).name)
      }
    }
    return rawSource
  }

  if (options) {
    if (options === true) {
      options = {
        classGenerator: {}
      }
    }
    scope.classGenerator = new ClassGenerator(options.classGenerator)
    scope.jsHandler = (rawSource: string) => {
      scope.recorder.js.push(rawSource)
      return handleValue(rawSource)
    }
    scope.cssHandler = (rawSource: string) => {
      // process 最后处理, loader 无所谓顺序
      scope.recorder.css.push(rawSource)
      return handleValue(rawSource)
    }

    scope.wxmlHandler = (rawSource: string) => {
      //  splitCode(rawSource)
      scope.recorder.wxml.push(rawSource)
      return handleValue(rawSource)
    }
  }
}

export function setRuntimeSet(runtimeSet: Set<string>) {
  const newSet = new Set<string>()
  runtimeSet.forEach((c) => {
    if (defaultMangleClassFilter(c)) {
      newSet.add(c)
    }
  })
  scope.runtimeSet = newSet
}
