import { describe, expect, it } from 'vitest'
import postcss from 'postcss'
import { resolvePostcssStyleBranch, resolvePostcssStyleBranchProfile } from '@/branches'
import { resolvePostcssFrameworkProfile, resolvePostcssFrameworkStrategy } from '@/frameworks'
import type { IStyleHandlerOptions } from '@/types'

async function runPostprocess(options: Partial<IStyleHandlerOptions>, css: string) {
  const result = await postcss([]).process(css, { from: undefined })
  const profile = resolvePostcssFrameworkProfile(options)
  return profile.postprocess(result, options as IStyleHandlerOptions)
}

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

    const pipeline = createStyleHandler({
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
    }).getPipeline()

    expect(pipeline.framework).toBe('uni-app-x')
    expect(pipeline.target).toBe('uni-app-x-css-uvue')
    expect(pipeline.branch).toBe('uni-app-x-css-uvue')
  })
})

describe('postcss framework strategy isolation', () => {
  const css = [
    'view,text{--tw-translate-x:0;}',
    '.transform{transform:translate(var(--tw-translate-x));}',
    '.block{display:block;}',
  ].join('\n')

  it('keeps each mini-program framework on its own strategy while sharing the mini-program target profile', () => {
    expect(resolvePostcssFrameworkStrategy({ appType: 'taro' }).framework).toBe('taro')
    expect(resolvePostcssFrameworkStrategy({ appType: 'mpx' }).framework).toBe('mpx')
    expect(resolvePostcssFrameworkStrategy({ appType: 'weapp-vite' }).framework).toBe('weapp-vite')

    expect(resolvePostcssFrameworkProfile({ appType: 'taro' })).toMatchObject({
      framework: 'taro',
      target: 'mini-program',
      branch: 'mini-program',
    })
    expect(resolvePostcssFrameworkProfile({ appType: 'mpx' })).toMatchObject({
      framework: 'mpx',
      target: 'mini-program',
      branch: 'mini-program',
    })
  })

  it('routes web-like platforms through the selected framework strategy without loading mini-program target processing', () => {
    expect(resolvePostcssFrameworkProfile({
      appType: 'uni-app-vite',
      platform: 'h5',
    })).toMatchObject({
      framework: 'uni-app-vite',
      target: 'web',
      branch: 'web',
    })

    expect(resolvePostcssFrameworkProfile({
      appType: 'taro',
      platform: 'app-plus',
    })).toMatchObject({
      framework: 'taro',
      target: 'web',
      branch: 'web',
    })
  })

  it('lets uni-app x own webview and uvue targets even when platform looks web-like', () => {
    expect(resolvePostcssFrameworkProfile({
      appType: 'uni-app-x',
      uniAppX: true,
      platform: 'h5',
    })).toMatchObject({
      framework: 'uni-app-x',
      target: 'uni-app-x-css-webview',
      branch: 'uni-app-x-css-webview',
    })

    expect(resolvePostcssFrameworkProfile({
      appType: 'uni-app-x',
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
      platform: 'h5',
    })).toMatchObject({
      framework: 'uni-app-x',
      target: 'uni-app-x-css-uvue',
      branch: 'uni-app-x-css-uvue',
    })
  })

  it('does not run uni-app x webview postprocess for taro or mpx', async () => {
    const taro = await runPostprocess({ appType: 'taro' }, css)
    const mpx = await runPostprocess({ appType: 'mpx' }, css)

    expect(taro.css).toContain('view,text')
    expect(taro.css).toContain('--tw-translate-x:0')
    expect(taro.css).toContain('display:block')
    expect(mpx.css).toContain('view,text')
    expect(mpx.css).toContain('--tw-translate-x:0')
    expect(mpx.css).toContain('display:block')
  })

  it('does not run uvue unsupported-declaration cleanup for mini-program or web profiles', async () => {
    const miniProgram = await runPostprocess({ appType: 'weapp-vite' }, css)
    const web = await runPostprocess({ appType: 'uni-app-vite', platform: 'h5' }, css)

    expect(miniProgram.css).toContain('.block{display:block')
    expect(web.css).toContain('.block{display:block')
  })

  it('isolates uni-app x webview base compatibility from uvue unsupported utility cleanup', async () => {
    const webview = await runPostprocess({
      appType: 'uni-app-x',
      uniAppX: true,
    }, css)
    const uvue = await runPostprocess({
      appType: 'uni-app-x',
      uniAppX: true,
      uniAppXCssTarget: 'uvue',
      uniAppXUnsupported: 'silent',
    }, css)

    expect(webview.css).not.toContain('view,text')
    expect(webview.css).toContain('--tw-translate-x:0')
    expect(webview.css).toContain('.block{display:block')
    expect(uvue.css).not.toContain('view,text')
    expect(uvue.css).not.toContain('.block')
  })
})
