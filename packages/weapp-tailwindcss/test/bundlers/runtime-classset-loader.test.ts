import { describe, expect, it, vi } from 'vitest'
import loader from '@/bundlers/webpack/loaders/weapp-tw-runtime-classset-loader'

describe('bundlers/runtime classset loader', () => {
  it('registers watch files and contexts after runtime set preparation', async () => {
    const addDependency = vi.fn()
    const addContextDependency = vi.fn()
    const getClassSet = vi.fn(async () => {})
    const getWatchDependencies = vi.fn(async () => ({
      files: ['/workspace/src/index.html', '/workspace/tailwind.config.ts'],
      contexts: ['/workspace/src'],
    }))

    const source = '.app {}'
    const result = await loader.call({
      addDependency,
      addContextDependency,
      query: {
        getClassSet,
        getWatchDependencies,
      },
      resourcePath: '/workspace/src/app.css',
    } as any, source)

    expect(result).toBe(source)
    expect(getClassSet).toHaveBeenCalledTimes(1)
    expect(getWatchDependencies).toHaveBeenCalledTimes(1)
    expect(addDependency).toHaveBeenCalledWith('/workspace/src/index.html')
    expect(addDependency).toHaveBeenCalledWith('/workspace/tailwind.config.ts')
    expect(addContextDependency).toHaveBeenCalledWith('/workspace/src')
  })
})
