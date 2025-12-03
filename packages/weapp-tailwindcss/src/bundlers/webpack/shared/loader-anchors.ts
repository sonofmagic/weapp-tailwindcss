import type { AppType } from '@/types'
import { isMpx } from '@/shared/mpx'

export interface LoaderEntry { loader?: string }

const MPX_STRIP_CONDITIONAL_LOADER = '@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader'
const MPX_STYLE_COMPILER_LOADER = '@mpxjs/webpack-plugin/lib/style-compiler/index'
const MPX_REWRITE_PRECEDENCE_LOADERS = [
  MPX_STYLE_COMPILER_LOADER,
  MPX_STRIP_CONDITIONAL_LOADER,
]

function createFinder(targets: string[]) {
  return (entries: LoaderEntry[]) => entries.findIndex(entry =>
    targets.some(target => entry?.loader?.includes?.(target)),
  )
}

function createPrioritizedFinder(targets: string[]) {
  return (entries: LoaderEntry[]) => {
    for (const target of targets) {
      const idx = entries.findIndex(entry => entry?.loader?.includes?.(target))
      if (idx !== -1) {
        return idx
      }
    }
    return -1
  }
}

export function createLoaderAnchorFinders(appType?: AppType) {
  if (isMpx(appType)) {
    // Rewrite should run before style-compiler (and strip-conditional as fallback);
    // class-set should still run after style-compiler.
    return {
      findRewriteAnchor: createPrioritizedFinder(MPX_REWRITE_PRECEDENCE_LOADERS),
      findClassSetAnchor: createFinder([MPX_STYLE_COMPILER_LOADER]),
    }
  }

  const fallbackFinder = createFinder(['postcss-loader'])
  return {
    findRewriteAnchor: fallbackFinder,
    findClassSetAnchor: fallbackFinder,
  }
}
