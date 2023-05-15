import { ClassGenerator, cssHandler, jsHandler } from 'tailwindcss-mangle-core'
import { UserDefinedOptions } from '@/types'
// import type { BabelFileResult } from '@babel/core'
const scope: {
  rawOptions: UserDefinedOptions['mangle']
  runtimeSet?: Set<string>
  classGenerator: ClassGenerator
  cssHandler: (rawSource: string) => string //  typeof cssHandler
  jsHandler: (rawSource: string) => string // typeof jsHandler
} = {
  rawOptions: false,
  classGenerator: new ClassGenerator(),
  cssHandler: (x) => x,
  jsHandler: (x) => x
}

export function useStore() {
  return scope as Required<typeof scope>
}

export function initStore(options: UserDefinedOptions['mangle']) {
  scope.rawOptions = options
  if (options) {
    if (options === true) {
      options = {
        classGenerator: {}
      }
    }
    scope.classGenerator = new ClassGenerator(options.classGenerator)
    scope.jsHandler = (rawSource: string) => {
      return jsHandler(rawSource, {
        classGenerator: scope.classGenerator,
        runtimeSet: scope.runtimeSet!,
        splitQuote: false
      }).code!
    }
    scope.cssHandler = (rawSource: string) => {
      // process 最后处理, loader 无所谓顺序
      return cssHandler(rawSource, {
        classGenerator: scope.classGenerator,
        runtimeSet: scope.runtimeSet!,
        scene: 'process'
      })
    }
  }
}

export function setRuntimeSet(runtimeSet: Set<string>) {
  scope.runtimeSet = runtimeSet
}
