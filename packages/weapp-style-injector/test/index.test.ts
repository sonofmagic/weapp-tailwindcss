import type { OutputAsset } from 'rollup'
import weappStyleInjector from '@/index'

function createAsset(source: string | Uint8Array, fileName: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    name: fileName,
    source,
  }
}

describe('weapp-style-injector plugin', () => {
  async function runPlugin(bundle: Record<string, OutputAsset>, options = {}) {
    const plugin = weappStyleInjector({
      imports: ['shared/common.wxss'],
      ...options,
    })

    await plugin.generateBundle?.call({} as any, {} as any, bundle)
  }

  it('injects @import statements into matching assets', async () => {
    const bundle = {
      'app.wxss': createAsset('.btn { color: red; }', 'app.wxss'),
    }

    await runPlugin(bundle)

    expect(bundle['app.wxss'].source).toBe(`@import "shared/common.wxss";\n.btn { color: red; }`)
  })

  it('skips files that do not match include patterns', async () => {
    const bundle = {
      'app.js': createAsset('console.log("noop")', 'app.js'),
    }

    await runPlugin(bundle)

    expect(bundle['app.js'].source).toBe('console.log("noop")')
  })

  it('supports custom include and exclude patterns', async () => {
    const bundle = {
      'styles/page.wxss': createAsset('.foo {}', 'styles/page.wxss'),
      'styles/ignore.wxss': createAsset('.bar {}', 'styles/ignore.wxss'),
    }

    await runPlugin(bundle, {
      include: ['styles/**/*.wxss'],
      exclude: ['**/ignore.wxss'],
    })

    expect(bundle['styles/page.wxss'].source).toBe(`@import "shared/common.wxss";\n.foo {}`)
    expect(bundle['styles/ignore.wxss'].source).toBe('.bar {}')
  })

  it('dedupes imports by default', async () => {
    const bundle = {
      'app.wxss': createAsset(`@import "shared/common.wxss";\n.page {}`, 'app.wxss'),
    }

    await runPlugin(bundle)

    expect(bundle['app.wxss'].source).toBe(`@import "shared/common.wxss";\n.page {}`)
  })

  it('allows injecting raw @import statements', async () => {
    const bundle = {
      'app.wxss': createAsset('.page {}', 'app.wxss'),
    }

    const plugin = weappStyleInjector({
      imports: ['@import url("https://cdn.example.com/theme.css")'],
    })

    await plugin.generateBundle?.call({} as any, {} as any, bundle)

    expect(bundle['app.wxss'].source).toBe(`@import url("https://cdn.example.com/theme.css");\n.page {}`)
  })

  it('can disable dedupe to force duplicate statements', async () => {
    const bundle = {
      'app.wxss': createAsset(`@import "shared/common.wxss";`, 'app.wxss'),
    }

    await runPlugin(bundle, {
      dedupe: false,
    })

    expect(bundle['app.wxss'].source).toBe(`@import "shared/common.wxss";\n@import "shared/common.wxss";`)
  })
})
