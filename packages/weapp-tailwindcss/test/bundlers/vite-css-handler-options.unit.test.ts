import { describe, expect, it, vi } from 'vitest'
import { createCssHandlerOptionsCache } from '@/bundlers/vite/generate-bundle/css-handler-options'

describe('bundlers/vite css handler options', () => {
  it('separates Vite request metadata from the PostCSS source path', () => {
    const styleRequest = '/workspace/src/components/HelloWorld.vue?vue=&type=style&index=0&scoped=true&lang=scss'
    const options = createCssHandlerOptionsCache({
      getAppType: () => 'uni-app-vite',
      getMajorVersion: () => 4,
      getOutputRoot: () => '/workspace/dist/dev/mp-weixin',
      mainCssChunkMatcher: vi.fn(() => false),
    }).getCssHandlerOptions(styleRequest)

    expect(options.postcssOptions.options.from).toBe('/workspace/src/components/HelloWorld.vue')
    expect(options.postcssOptions.options.from).not.toContain('?')
    expect(options.sourceOptions).toEqual({
      outputRoot: '/workspace/dist/dev/mp-weixin',
      requestFile: styleRequest,
    })
  })
})
