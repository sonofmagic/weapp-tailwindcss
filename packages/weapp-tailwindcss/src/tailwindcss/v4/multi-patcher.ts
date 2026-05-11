import type { TailwindcssPatcherLike } from '@/types'
import { runtimeSignaturePatchersSymbol } from '@/tailwindcss/runtime/cache'

export function createMultiTailwindcssPatcher(patchers: TailwindcssPatcherLike[]): TailwindcssPatcherLike {
  if (patchers.length <= 1) {
    return patchers[0]
  }

  const first = patchers[0]!
  const firstWithoutPatch = { ...first }
  delete firstWithoutPatch.patch
  const multiPatcher: TailwindcssPatcherLike = {
    ...firstWithoutPatch,
    packageInfo: first?.packageInfo,
    majorVersion: first?.majorVersion,
    options: first?.options,
    async getClassSet() {
      const aggregated = new Set<string>()
      for (const patcher of patchers) {
        const current = await patcher.getClassSet()
        for (const className of current) {
          aggregated.add(className)
        }
      }
      return aggregated
    },
    async extract(options) {
      const aggregatedSet = new Set<string>()
      const aggregatedList: string[] = []
      let filename: string | undefined
      for (const patcher of patchers) {
        const result = await patcher.extract(options)
        if (!result) {
          continue
        }
        if (filename === undefined && result.filename) {
          filename = result.filename
        }
        if (result.classList) {
          for (const className of result.classList) {
            if (!aggregatedSet.has(className)) {
              aggregatedList.push(className)
            }
            aggregatedSet.add(className)
          }
        }
        if (result.classSet) {
          for (const className of result.classSet) {
            aggregatedSet.add(className)
          }
        }
      }
      return {
        classList: aggregatedList,
        classSet: aggregatedSet,
        filename,
      }
    },
  }

  if (patchers.every(patcher => typeof patcher.getClassSetSync === 'function')) {
    multiPatcher.getClassSetSync = () => {
      const aggregated = new Set<string>()
      for (const patcher of patchers) {
        const current = patcher.getClassSetSync?.()
        if (!current) {
          continue
        }
        for (const className of current) {
          aggregated.add(className)
        }
      }
      return aggregated
    }
  }

  Object.defineProperty(multiPatcher, runtimeSignaturePatchersSymbol, {
    value: [...patchers],
    configurable: true,
  })

  return multiPatcher
}
