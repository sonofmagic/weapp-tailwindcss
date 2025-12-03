import type { AppType } from '@/types'

export interface LoaderEntry { loader?: string }

function createFinder(candidates: string[]) {
  return (entries: LoaderEntry[]) => {
    for (const candidate of candidates) {
      const index = entries.findIndex(entry => entry?.loader?.includes?.(candidate))
      if (index !== -1) {
        return index
      }
    }
    return -1
  }
}

export function createLoaderAnchorFinders(appType?: AppType) {
  if (appType === 'mpx') {
    return {
      // 重写需要尽量提前到 strip-conditional-loader 之前。
      findRewriteAnchor: createFinder([
        '@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader',
        '@mpxjs/webpack-plugin/lib/style-compiler/index',
        'postcss-loader',
      ]),
      // class set 需等 style-compiler/index 跑完再做。
      findClassSetAnchor: createFinder([
        '@mpxjs/webpack-plugin/lib/style-compiler/index',
        '@mpxjs/webpack-plugin/lib/style-compiler/strip-conditional-loader',
        'postcss-loader',
      ]),
    }
  }

  const find = createFinder(['postcss-loader'])
  return {
    findRewriteAnchor: find,
    findClassSetAnchor: find,
  }
}
