import { describe, expect, it } from 'vitest'

describe('defaults getDefaultOptions', () => {
  it('ignores call expression identifiers by default', async () => {
    const { getDefaultOptions } = await import('@/defaults')
    const options = getDefaultOptions()

    expect(options.ignoreCallExpressionIdentifiers).toEqual([])
  })

  it('matches legacy main css chunks without app type specific hard-coding', async () => {
    const { getDefaultOptions } = await import('@/defaults')
    const options = getDefaultOptions()

    const matcher = options.mainCssChunkMatcher!

    for (const appType of ['uni-app', 'uni-app-vite', 'uni-app-x', 'taro', 'mpx', 'rax', 'remax', 'native', 'weapp-vite', 'kbone'] as const) {
      expect(matcher('app.css', appType)).toBe(true)
      expect(matcher('common/main.css', appType)).toBe(true)
      expect(matcher('bundle.css', appType)).toBe(true)
      expect(matcher('miniprogram-app.css', appType)).toBe(true)
      expect(matcher('common/miniprogram-app.css', appType)).toBe(true)
      expect(matcher('styles/app364cd4a4.wxss', appType)).toBe(true)
      expect(matcher('styles/sub/a.wxss', appType)).toBe(true)
      expect(matcher('wx/styles/app364cd4a4.wxss', appType)).toBe(true)
      expect(matcher('main.css', appType)).toBe(false)
      expect(matcher('other.css', appType)).toBe(false)
    }

    expect(matcher('app.wxss')).toBe(true)
    expect(matcher('common/main.wxss')).toBe(true)
    expect(matcher('bundle.wxss')).toBe(true)
    expect(matcher('styles/app364cd4a4.wxss')).toBe(true)
    expect(matcher('pages/index/index.wxss')).toBe(false)
    expect(matcher('anything.css', 'unknown-type' as any)).toBe(false)
  })

  it('filters css and html and js files correctly', async () => {
    const { getDefaultOptions } = await import('@/defaults')
    const options = getDefaultOptions()

    expect(typeof options.cssMatcher === 'function' && options.cssMatcher('foo.wxss')).toBe(true)
    expect(typeof options.cssMatcher === 'function' && options.cssMatcher('foo.css')).toBe(true)
    expect(typeof options.cssMatcher === 'function' && options.cssMatcher('foo.scss')).toBe(false)

    expect(typeof options.htmlMatcher === 'function' && options.htmlMatcher('foo.wxml')).toBe(true)
    expect(typeof options.htmlMatcher === 'function' && options.htmlMatcher('foo.axml')).toBe(true)
    expect(typeof options.htmlMatcher === 'function' && options.htmlMatcher('foo.html')).toBe(false)

    expect(typeof options.jsMatcher === 'function' && options.jsMatcher('foo.js')).toBe(true)
    expect(typeof options.jsMatcher === 'function' && options.jsMatcher('foo.mjs')).toBe(true)
    expect(typeof options.jsMatcher === 'function' && options.jsMatcher('foo.jsx')).toBe(false)
    expect(typeof options.jsMatcher === 'function' && options.jsMatcher('node_modules/foo.js')).toBe(false)
    expect(typeof options.wxsMatcher === 'function' && options.wxsMatcher('foo.wxs')).toBe(false)
  })

  it('disables runtime package replacement by default', async () => {
    const { getDefaultOptions } = await import('@/defaults')
    const options = getDefaultOptions()

    expect(options.replaceRuntimePackages).toBe(false)
  })
})
