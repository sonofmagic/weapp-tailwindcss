import { ClassGenerator, cssHandler, jsHandler } from 'tailwindcss-mangle-core'
import { UserDefinedOptions } from '@/types'
import { splitCode } from '@/extractors/split'

function getSelf(x: string) {
  return x
}
// import type { BabelFileResult } from '@babel/core'
// 为什么要用这种方式，因为一层一层往下传递参数，太烦了
// 所以说还是搞个 IOC 容器比较爽，要什么注入什么
export const scope: {
  rawOptions: UserDefinedOptions['mangle']
  runtimeSet: Set<string>
  classGenerator: ClassGenerator
  cssHandler: (rawSource: string) => string //  typeof cssHandler
  jsHandler: (rawSource: string) => string // typeof jsHandler
  wxmlHandler: (rawSource: string) => string
} = {
  rawOptions: false,
  runtimeSet: new Set<string>(),
  classGenerator: new ClassGenerator(),
  cssHandler: getSelf,
  jsHandler: getSelf,
  wxmlHandler: getSelf
} // as default

// export function useStore() {
//   return scope as Required<typeof scope>
// }

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

    scope.wxmlHandler = (rawSource: string) => {
      //  splitCode(rawSource)
      return rawSource
    }
  }
}

export function setRuntimeSet(runtimeSet: Set<string>) {
  scope.runtimeSet = runtimeSet
}
