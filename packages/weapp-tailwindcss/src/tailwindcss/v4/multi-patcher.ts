import type { TailwindcssPatcherLike, TailwindcssRuntimeLike } from '@/types'
import { runtimeSignatureRuntimesSymbol } from '@/tailwindcss/runtime/cache'
import { omitUndefined } from '@/utils/object'

export function createMultiTailwindcssRuntime(runtimes: TailwindcssRuntimeLike[]): TailwindcssRuntimeLike {
  if (runtimes.length <= 1) {
    const [runtime] = runtimes
    if (!runtime) {
      throw new Error('createMultiTailwindcssRuntime requires at least one runtime.')
    }
    return runtime
  }

  const first = runtimes[0]!
  const { patch: _patch, ...firstWithoutPatch } = first as TailwindcssRuntimeLike & { patch?: unknown }
  const multiRuntime: TailwindcssRuntimeLike = {
    ...firstWithoutPatch,
    packageInfo: first?.packageInfo,
    majorVersion: first?.majorVersion,
    options: first?.options,
    async getClassSet() {
      const aggregated = new Set<string>()
      for (const runtime of runtimes) {
        const current = await runtime.getClassSet()
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
      for (const runtime of runtimes) {
        const result = await runtime.extract(options)
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
      return omitUndefined({
        classList: aggregatedList,
        classSet: aggregatedSet,
        filename,
      }) as Awaited<ReturnType<TailwindcssRuntimeLike['extract']>>
    },
  }

  if (runtimes.every(runtime => typeof runtime.getClassSetSync === 'function')) {
    multiRuntime.getClassSetSync = () => {
      const aggregated = new Set<string>()
      for (const runtime of runtimes) {
        const current = runtime.getClassSetSync?.()
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

  Object.defineProperty(multiRuntime, runtimeSignatureRuntimesSymbol, {
    value: [...runtimes],
    configurable: true,
  })

  return multiRuntime
}

/**
 * @deprecated 请使用 `createMultiTailwindcssRuntime`。
 */
export const createMultiTailwindcssPatcher = createMultiTailwindcssRuntime as (patchers: TailwindcssPatcherLike[]) => TailwindcssPatcherLike
