import type { TailwindcssPatcherLike } from '@/types'
import { createDebug } from '@/debug'

const debug = createDebug('[tailwindcss:runtime] ')

function shouldPreferSync(majorVersion: number | undefined) {
  if (majorVersion == null) {
    return true
  }
  if (majorVersion === 3) {
    return true
  }
  if (majorVersion === 4) {
    return true
  }
  return false
}

function tryGetRuntimeClassSetSync(twPatcher: TailwindcssPatcherLike) {
  if (typeof twPatcher.getClassSetSync !== 'function') {
    return undefined
  }

  if (!shouldPreferSync(twPatcher.majorVersion)) {
    return undefined
  }

  try {
    return twPatcher.getClassSetSync()
  }
  catch (error) {
    if (twPatcher.majorVersion === 4) {
      debug('getClassSetSync() unavailable for tailwindcss v4, fallback to async getClassSet(): %O', error)
    }
    else {
      debug('getClassSetSync() failed, fallback to async getClassSet(): %O', error)
    }
    return undefined
  }
}

async function collectRuntimeClassSet(twPatcher: TailwindcssPatcherLike): Promise<Set<string>> {
  const syncSet = tryGetRuntimeClassSetSync(twPatcher)
  if (syncSet) {
    return syncSet
  }

  try {
    const result = await twPatcher.extract({ write: false })
    if (result?.classSet) {
      return result.classSet
    }
  }
  catch (error) {
    debug('extract() failed, fallback to getClassSet(): %O', error)
  }

  try {
    const fallbackSet = await Promise.resolve(twPatcher.getClassSet())
    if (fallbackSet) {
      return fallbackSet
    }
  }
  catch (error) {
    debug('getClassSet() failed, returning empty set: %O', error)
  }

  return new Set<string>()
}

export { collectRuntimeClassSet }
