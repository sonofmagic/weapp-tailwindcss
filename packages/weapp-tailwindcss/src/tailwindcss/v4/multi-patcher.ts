import type { TailwindcssPatcherLike } from '@/types'

export function createMultiTailwindcssPatcher(patchers: TailwindcssPatcherLike[]): TailwindcssPatcherLike {
  if (patchers.length <= 1) {
    return patchers[0]
  }

  type PatchResult = Awaited<ReturnType<TailwindcssPatcherLike['patch']>>

  const [first] = patchers
  const multiPatcher: TailwindcssPatcherLike = {
    ...first,
    packageInfo: first?.packageInfo,
    majorVersion: first?.majorVersion,
    options: first?.options,
    async patch() {
      let exposeContext: PatchResult['exposeContext']
      let extendLengthUnits: PatchResult['extendLengthUnits']
      for (const patcher of patchers) {
        const result = await patcher.patch()
        if (result?.exposeContext && exposeContext == null) {
          exposeContext = result.exposeContext
        }
        if (result?.extendLengthUnits && extendLengthUnits == null) {
          extendLengthUnits = result.extendLengthUnits
        }
      }
      return {
        exposeContext,
        extendLengthUnits,
      }
    },
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

  return multiPatcher
}
