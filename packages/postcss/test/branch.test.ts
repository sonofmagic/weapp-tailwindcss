import { describe, expect, it } from 'vitest'
import { resolvePostcssStyleBranch, shouldApplyUniAppXBaseCompatibility, shouldApplyUniAppXUvueCompatibility } from '@/branches'

describe('postcss style branch resolver', () => {
  it('separates mini-program framework css from generic css', () => {
    expect(resolvePostcssStyleBranch({
      appType: 'taro',
    })).toBe('mini-program')

    expect(resolvePostcssStyleBranch({})).toBe('generic')
  })

  it('routes web-like platforms away from mini-program css transforms', () => {
    expect(resolvePostcssStyleBranch({
      appType: 'uni-app-vite',
      platform: 'h5',
    })).toBe('web')

    expect(resolvePostcssStyleBranch({
      appType: 'taro',
      platform: 'app-plus',
    })).toBe('web')
  })

  it('isolates uni-app x webview and uvue compatibility', () => {
    const webview = resolvePostcssStyleBranch({
      appType: 'uni-app-x',
      uniAppX: true,
    })
    const uvue = resolvePostcssStyleBranch({
      appType: 'uni-app-x',
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
    })

    expect(webview).toBe('uni-app-x-webview')
    expect(uvue).toBe('uni-app-x-uvue')
    expect(shouldApplyUniAppXBaseCompatibility(webview)).toBe(true)
    expect(shouldApplyUniAppXBaseCompatibility(uvue)).toBe(true)
    expect(shouldApplyUniAppXUvueCompatibility(webview)).toBe(false)
    expect(shouldApplyUniAppXUvueCompatibility(uvue)).toBe(true)
  })
})
