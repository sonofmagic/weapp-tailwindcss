import { describe, expect, it } from 'vitest'

describe('defaults getDefaultOptions', () => {
  it('ignores call expression identifiers by default', async () => {
    const { getDefaultOptions } = await import('@/defaults')
    const options = getDefaultOptions()

    expect(options.ignoreCallExpressionIdentifiers).toEqual([])
  })

  it('matches main css chunks based on app type', async () => {
    const { getDefaultOptions } = await import('@/defaults')
    const options = getDefaultOptions()

    const matcher = options.mainCssChunkMatcher!

    expect(matcher('common/main.css', 'uni-app')).toBe(true)
    expect(matcher('app.css', 'uni-app')).toBe(true)
    expect(matcher('other.css', 'uni-app')).toBe(false)

    expect(matcher('app.css', 'uni-app-vite')).toBe(true)
    expect(matcher('common/main.css', 'uni-app-vite')).toBe(true)
    expect(matcher('main.css', 'uni-app-vite')).toBe(false)

    expect(matcher('app.css', 'taro')).toBe(true)
    expect(matcher('main.css', 'taro')).toBe(false)

    expect(matcher('app.css', 'mpx')).toBe(true)
    expect(matcher('main.css', 'mpx')).toBe(false)

    expect(matcher('bundle.css', 'rax')).toBe(true)
    expect(matcher('app.css', 'rax')).toBe(false)

    expect(matcher('app.css', 'remax')).toBe(true)
    expect(matcher('main.css', 'remax')).toBe(false)

    expect(matcher('app.css', 'native')).toBe(true)
    expect(matcher('main.css', 'native')).toBe(false)

    expect(matcher('miniprogram-app.css', 'kbone')).toBe(true)
    expect(matcher('common/miniprogram-app.css', 'kbone')).toBe(true)
    expect(matcher('app.css', 'kbone')).toBe(false)

    expect(matcher(
      'anything.css',
      // @ts-ignore
      'unknown-type',
    )).toBe(true)
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
