import type { InternalUserDefinedOptions, IStyleHandlerOptions } from '@/types'

type CssHandlerOptions = IStyleHandlerOptions & {
  postcssOptions: {
    options: {
      from: string
    }
  }
  majorVersion: number | undefined
}

interface CssHandlerOptionsCacheOptions {
  appType: InternalUserDefinedOptions['appType']
  mainCssChunkMatcher: InternalUserDefinedOptions['mainCssChunkMatcher']
  getMajorVersion: () => number | undefined
}

export interface CssHandlerOptionsCache {
  getCssHandlerOptions: (file: string) => CssHandlerOptions
  getCssUserHandlerOptions: (file: string) => CssHandlerOptions
}

export function createCssHandlerOptionsCache(options: CssHandlerOptionsCacheOptions): CssHandlerOptionsCache {
  const cssHandlerOptionsCache = new Map<string, CssHandlerOptions>()
  const cssUserHandlerOptionsCache = new Map<string, CssHandlerOptions>()

  const getCssHandlerOptions = (file: string) => {
    const majorVersion = options.getMajorVersion()
    const isMainChunk = options.mainCssChunkMatcher(file, options.appType)
    const cacheKey = `${majorVersion ?? 'unknown'}:${isMainChunk ? '1' : '0'}:${file}`
    const cached = cssHandlerOptionsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const created = {
      isMainChunk,
      postcssOptions: {
        options: {
          from: file,
        },
      },
      majorVersion,
    }
    cssHandlerOptionsCache.set(cacheKey, created)
    return created
  }

  const getCssUserHandlerOptions = (file: string) => {
    const majorVersion = options.getMajorVersion()
    const cacheKey = `${majorVersion ?? 'unknown'}:${file}`
    const cached = cssUserHandlerOptionsCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const created = {
      ...getCssHandlerOptions(file),
      isMainChunk: false,
    }
    cssUserHandlerOptionsCache.set(cacheKey, created)
    return created
  }

  return {
    getCssHandlerOptions,
    getCssUserHandlerOptions,
  }
}
