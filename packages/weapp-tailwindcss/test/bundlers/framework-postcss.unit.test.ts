import type { InternalUserDefinedOptions } from '@/types'
import { describe, expect, it } from 'vitest'
import {
  captureFrameworkPostcssPlugins,
  collectFrameworkPostcssPluginsFromLoaderEntries,
  resolveFrameworkPostcssPlugins,
  transformGeneratedCssWithFrameworkPostcss,
} from '@/bundlers/shared/framework-postcss'

const owner = () => ({}) as InternalUserDefinedOptions

function createPxTransformPlugin() {
  return {
    postcssPlugin: 'postcss-pxtransform',
    Declaration(decl: { prop: string, value: string }) {
      if (decl.prop.startsWith('--') && decl.value.includes('4px')) {
        decl.value = decl.value.replaceAll('4px', '8rpx')
      }
    },
  }
}

describe('framework PostCSS bridge', () => {
  it('selects and de-duplicates only pxtransform plugins', () => {
    const px = createPxTransformPlugin()
    const pxCreator = Object.assign(() => createPxTransformPlugin(), { postcss: true })
    const other = { postcssPlugin: 'autoprefixer' }
    expect(resolveFrameworkPostcssPlugins([px, px, pxCreator, other, null, false])).toEqual([px, pxCreator])
    expect(resolveFrameworkPostcssPlugins({ px, other })).toEqual([px])
    expect(resolveFrameworkPostcssPlugins('postcss-pxtransform')).toEqual([])
    expect(resolveFrameworkPostcssPlugins(undefined)).toEqual([])
  })

  it('collects pxtransform from nested webpack loader rules', () => {
    const px = createPxTransformPlugin()
    const result = collectFrameworkPostcssPluginsFromLoaderEntries([
      {
        oneOf: [{
          use: [{
            loader: '/node_modules/postcss-loader/index.js',
            options: { postcssOptions: { plugins: { px } } },
          }],
        }],
      },
      {
        rules: {
          use: {
            loader: '/node_modules/postcss-loader/index.js',
            options: { postcssOptions: { plugins: [px] } },
          },
        },
      },
      { loader: '/node_modules/postcss-loader/index.js' },
      { loader: '/node_modules/postcss-loader/index.js', options: false },
      { loader: 42, use: null },
      { loader: '/node_modules/css-loader/index.js' },
      null,
    ])
    expect(result).toEqual([px])
    expect(collectFrameworkPostcssPluginsFromLoaderEntries([{
      loader: '/node_modules/postcss-loader/index.js',
      options: { postcssOptions: null },
    }])).toEqual([])
    expect(collectFrameworkPostcssPluginsFromLoaderEntries([{
      loader: '/node_modules/postcss-loader/index.js',
      options: { postcssOptions: {} },
    }])).toEqual([])
  })

  it('returns unchanged CSS when no captured plugin or px value exists', async () => {
    const emptyOwner = owner()
    expect(await transformGeneratedCssWithFrameworkPostcss(emptyOwner, '.a{color:red}', '/tmp/a.css')).toBe('.a{color:red}')
    const noPxOwner = owner()
    captureFrameworkPostcssPlugins(noPxOwner, createPxTransformPlugin())
    expect(await transformGeneratedCssWithFrameworkPostcss(noPxOwner, '.a{--spacing:4rpx}', '/tmp/a.css')).toBe('.a{--spacing:4rpx}')
  })

  it('captures, transforms, and clears framework plugins by owner', async () => {
    const currentOwner = owner()
    const px = createPxTransformPlugin()
    expect(captureFrameworkPostcssPlugins(currentOwner, [px])).toEqual([px])
    expect(await transformGeneratedCssWithFrameworkPostcss(currentOwner, '.a{--spacing:4px}', '/tmp/a.css')).toBe('.a{--spacing:8rpx}')
    expect(captureFrameworkPostcssPlugins(currentOwner, [])).toEqual([])
    expect(await transformGeneratedCssWithFrameworkPostcss(currentOwner, '.a{--spacing:4px}', '/tmp/a.css')).toBe('.a{--spacing:4px}')
  })

  it('passes the real source file to framework PostCSS plugins', async () => {
    const currentOwner = owner()
    const files: string[] = []
    const px = {
      postcssPlugin: 'postcss-pxtransform',
      Declaration(decl: { source?: { input?: { file?: string } }, value: string }) {
        files.push(decl.source?.input?.file ?? '')
        if (files.at(-1)?.includes('/pages/issue-998/')) {
          decl.value = decl.value.replaceAll('4px', '8rpx')
        }
      },
    }
    captureFrameworkPostcssPlugins(currentOwner, [px])

    await expect(transformGeneratedCssWithFrameworkPostcss(
      currentOwner,
      ':root{--spacing:4px}',
      '/workspace/src/pages/issue-998/index.css',
    )).resolves.toBe(':root{--spacing:8rpx}')
    expect(files.length).toBeGreaterThan(0)
    expect(new Set(files)).toEqual(new Set(['/workspace/src/pages/issue-998/index.css']))
  })
})
