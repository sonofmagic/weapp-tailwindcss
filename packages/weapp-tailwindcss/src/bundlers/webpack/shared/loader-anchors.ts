import type { AppType } from '@/types'

export interface LoaderEntry { loader?: string }

export function createLoaderAnchorFinder(appType?: AppType) {
  const candidates = appType === 'mpx'
    ? ['@mpxjs/webpack-plugin/lib/style-compiler/index', 'postcss-loader']
    : ['postcss-loader']

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
