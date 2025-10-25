import type { TailwindcssPatcherLike } from '@/types'
import { createDebug } from '@/debug'

const debug = createDebug('[tailwindcss:runtime] ')

async function collectRuntimeClassSet(twPatcher: TailwindcssPatcherLike): Promise<Set<string>> {
  try {
    const result = await twPatcher.extract({ write: false })
    if (result?.classSet) {
      return result.classSet
    }
  }
  catch (error) {
    debug('extract() failed, fallback to getClassSet(): %O', error)
  }

  const fallbackSet = await twPatcher.getClassSet()
  return fallbackSet ?? new Set<string>()
}

export { collectRuntimeClassSet }
