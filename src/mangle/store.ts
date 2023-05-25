import { ClassGenerator, defaultMangleClassFilter } from 'tailwindcss-mangle-shared'
import { UserDefinedOptions } from '@/types'
import { splitCode } from '@/extractors/split'
import { escapeStringRegexp } from '@/reg'

function getSelf(x: string) {
  return x
}

export interface IMangleScopeStore {
  rawOptions: UserDefinedOptions['mangle']
  runtimeSet: Set<string>
  classGenerator: ClassGenerator
  filter: (className: string) => boolean
  cssHandler: (rawSource: string) => string
  jsHandler: (rawSource: string) => string
  wxmlHandler: (rawSource: string) => string
}

const defaultScopedStore: IMangleScopeStore = {
  rawOptions: false,
  runtimeSet: new Set<string>(),
  classGenerator: new ClassGenerator(),
  filter: defaultMangleClassFilter,
  cssHandler: getSelf,
  jsHandler: getSelf,
  wxmlHandler: getSelf
} // as default
// import type { BabelFileResult } from '@babel/core'
// 为什么要用这种方式，因为一层一层往下传递参数，太烦了
// 所以说还是搞个 IOC 容器比较爽，要什么注入什么
// 这样写其实是很有问题的
// 比如当插件被 new 了 2次，传入了不同的 store 然后就挂了
// TODO
const store = Object.assign({}, defaultScopedStore)

export function useStore() {
  return store
}

export function resetStore() {
  return Object.assign(store, defaultScopedStore)
}

function handleValue(rawSource: string) {
  const arr = splitCode(rawSource)
  for (const x of arr) {
    if (store.runtimeSet.has(x)) {
      rawSource = rawSource.replaceAll(new RegExp(escapeStringRegexp(x), 'g'), store.classGenerator.generateClassName(x).name)
    }
  }
  return rawSource
}

export function initStore(options: UserDefinedOptions['mangle']) {
  store.rawOptions = options

  if (options) {
    if (options === true) {
      options = {
        classGenerator: {},
        mangleClassFilter: defaultMangleClassFilter
      }
    }
    store.classGenerator = new ClassGenerator(options.classGenerator)
    store.filter = options.mangleClassFilter ?? defaultMangleClassFilter
    store.jsHandler = (rawSource: string) => {
      return handleValue(rawSource)
    }
    store.cssHandler = (rawSource: string) => {
      // process 最后处理, loader 无所谓顺序
      return handleValue(rawSource)
    }

    store.wxmlHandler = (rawSource: string) => {
      //  splitCode(rawSource)
      return handleValue(rawSource)
    }
  }
}

export function setRuntimeSet(runtimeSet: Set<string>) {
  const newSet = new Set<string>()
  for (const c of runtimeSet) {
    // eslint-disable-next-line unicorn/no-array-callback-reference
    if (store.filter(c)) {
      newSet.add(c)
    }
  }
  store.runtimeSet = newSet
}
