import { describe, expect, it } from 'vitest'
import { resolvePostcssStyleBranch, resolvePostcssStyleBranchProfile } from '@/branches'

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

    expect(webview).toBe('uni-app-x-css-webview')
    expect(uvue).toBe('uni-app-x-css-uvue')
  })

  it('resolves concrete css target branch profiles', () => {
    expect(resolvePostcssStyleBranchProfile({
      appType: 'uni-app-x',
      uniAppX: true,
    }).branch).toBe('uni-app-x-css-webview')

    expect(resolvePostcssStyleBranchProfile({
      appType: 'uni-app-x',
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
    }).branch).toBe('uni-app-x-css-uvue')
  })

  it('exposes branch on created style pipelines', async () => {
    const { createStyleHandler } = await import('@/handler')

    expect(createStyleHandler({
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
    }).getPipeline().branch).toBe('uni-app-x-css-uvue')
  })
})
