import { isWebpackPlugin } from './util'
import { defaultOptions } from '@/defaults'
const { mainCssChunkMatcher } = defaultOptions

describe('defaults function test group', () => {
  test('mainCssChunkMatcher', () => {
    const case1 = 'dsd/sdsd.wxss'

    const uniappWxss = 'common/main.wxss'

    const taroWxss = 'app.wxss'
    if (typeof mainCssChunkMatcher === 'function') {
      expect(mainCssChunkMatcher(case1, undefined)).toBe(true)

      expect(mainCssChunkMatcher(case1, 'taro')).toBe(false)

      expect(mainCssChunkMatcher(case1, 'uni-app')).toBe(false)

      expect(mainCssChunkMatcher(uniappWxss, 'uni-app')).toBe(true)

      expect(mainCssChunkMatcher(taroWxss, 'taro')).toBe(true)
    } else {
      expect(true).toBe(false)
    }
  })

  it('should export', () => {
    const { UnifiedWebpackPluginV5 } = require('../')
    const plugins = [UnifiedWebpackPluginV5]
    for (const plugin of plugins) {
      expect(isWebpackPlugin(plugin)).toBe(true)
    }
  })

  it('should replace export', () => {
    const { replaceCss, replaceJs } = require('../dist/replace') // await import('../replace')

    expect(replaceCss).toBeTruthy()
    expect(replaceJs).toBeTruthy()
    expect(typeof replaceCss).toBe('function')
    expect(typeof replaceJs).toBe('function')
  })
})
