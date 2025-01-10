import { getDefaultOptions } from '@/defaults'
import { isWebpackPlugin } from './util'

const { mainCssChunkMatcher } = getDefaultOptions()

describe('defaults function test group', () => {
  it('mainCssChunkMatcher', () => {
    const case1 = 'dsd/sdsd.wxss'

    const uniappWxss = 'common/main.wxss'

    const taroWxss = 'app.wxss'
    if (typeof mainCssChunkMatcher === 'function') {
      expect(mainCssChunkMatcher(case1, undefined)).toBe(true)

      expect(mainCssChunkMatcher(case1, 'taro')).toBe(false)

      expect(mainCssChunkMatcher(case1, 'uni-app')).toBe(false)

      expect(mainCssChunkMatcher(uniappWxss, 'uni-app')).toBe(true)

      expect(mainCssChunkMatcher(uniappWxss, 'uni-app-vite')).toBe(true)

      expect(mainCssChunkMatcher('app.wxss', 'mpx')).toBe(true)

      expect(mainCssChunkMatcher('app.wxss', 'remax')).toBe(true)

      expect(mainCssChunkMatcher('bundle.wxss', 'rax')).toBe(true)

      expect(mainCssChunkMatcher('miniprogram-app.wxss', 'kbone')).toBe(true)

      expect(mainCssChunkMatcher(taroWxss, 'taro')).toBe(true)
    }
    else {
      expect(true).toBe(false)
    }
  })

  it.skip('should export', () => {
    const { UnifiedWebpackPluginV5 } = require('../')
    const plugins = [UnifiedWebpackPluginV5]
    for (const plugin of plugins) {
      expect(isWebpackPlugin(plugin)).toBe(true)
    }
  })

  // it('should replace export', () => {
  //   const { replaceJs } = require('../dist/replace') // await import('../replace')

  //   // expect(replaceCss).toBeTruthy()
  //   expect(replaceJs).toBeTruthy()
  //   // expect(typeof replaceCss).toBe('function')
  //   expect(typeof replaceJs).toBe('function')
  // })
})
