import { pluginLynxTailwindcss, PLUGIN_NAME } from '../src/index'

function createApi() {
  let bundlerHandler: ((chain: any) => any) | undefined
  let rspackHandler: ((config: any) => any) | undefined
  return {
    api: {
      modifyBundlerChain(handler: (chain: any) => any) {
        bundlerHandler = handler
      },
      modifyRspackConfig(handler: (config: any) => any) {
        rspackHandler = handler
      },
    },
    getBundlerHandler: () => bundlerHandler,
    getRspackHandler: () => rspackHandler,
  }
}

describe('pluginLynxTailwindcss', () => {
  it('registers the core Rspack plugin with a fixed Lynx web CSS target', () => {
    const { api, getBundlerHandler, getRspackHandler } = createApi()
    const plugin = pluginLynxTailwindcss({
      generator: { target: 'weapp', webCompat: false } as any,
    })

    expect(plugin.name).toBe(PLUGIN_NAME)
    plugin.setup(api as never)

    const use = vi.fn()
    getBundlerHandler()?.({ plugin: vi.fn(() => ({ use })) })
    expect(use).toHaveBeenCalledOnce()
    const [, [options]] = use.mock.calls[0]!
    expect(options).toMatchObject({
      platform: 'lynx',
      cssOptions: { platform: 'lynx' },
      generator: {
        target: 'web',
        webCompat: true,
        styleOptions: { cssOptions: { platform: 'lynx' } },
      },
    })
    expect(getRspackHandler()).toBeTypeOf('function')
  })

  it('enables CSS generation by default when patching Rspack rules', () => {
    const { api, getRspackHandler } = createApi()
    pluginLynxTailwindcss().setup(api as never)
    const config = {
      module: {
        rules: [{
          use: [
            { loader: 'css-loader' },
            { loader: 'builtin:lightningcss-loader' },
          ],
        }],
      },
    }

    getRspackHandler()?.(config)

    const use = (config as any).module.rules[0].use
    expect(use.map((item: any) => item.loader)).toEqual([
      'css-loader',
      'builtin:lightningcss-loader',
      expect.stringMatching(/weapp-tw-css-import-rewrite-loader\.cjs$/),
    ])
    expect(use[2].options).toEqual({ generateCss: true })
  })

  it('preserves custom CSS loader settings while enabling generation', () => {
    const { api, getRspackHandler } = createApi()
    pluginLynxTailwindcss({
      rspack: {
        cssImportRewriteLoader: {
          loader: '/custom/css-loader.cjs',
          options: {
            tailwindcssImportRewriteRuntimeKey: 'lynx-runtime',
          },
        },
      },
    }).setup(api as never)
    const config = {
      module: {
        rules: [{
          use: [{ loader: 'builtin:lightningcss-loader' }],
        }],
      },
    }

    getRspackHandler()?.(config)

    expect((config as any).module.rules[0].use).toEqual([
      { loader: 'builtin:lightningcss-loader' },
      {
        loader: '/custom/css-loader.cjs',
        options: {
          tailwindcssImportRewriteRuntimeKey: 'lynx-runtime',
          generateCss: true,
        },
      },
    ])
  })

  it('does not patch CSS rules when the loader is explicitly disabled', () => {
    const { api, getRspackHandler } = createApi()
    pluginLynxTailwindcss({
      rspack: { cssImportRewriteLoader: false },
    }).setup(api as never)
    const config = {
      module: {
        rules: [{
          use: [{ loader: 'builtin:lightningcss-loader' }],
        }],
      },
    }

    getRspackHandler()?.(config)

    expect((config as any).module.rules[0].use).toEqual([
      { loader: 'builtin:lightningcss-loader' },
    ])
  })

  it('keeps repeated Rspack patches idempotent', () => {
    const { api, getRspackHandler } = createApi()
    pluginLynxTailwindcss().setup(api as never)
    const config = {
      module: {
        rules: [{
          use: [
            { loader: 'css-loader' },
            { loader: 'builtin:lightningcss-loader' },
          ],
        }],
      },
    }

    getRspackHandler()?.(config)
    getRspackHandler()?.(config)

    expect((config as any).module.rules[0].use).toHaveLength(3)
    expect((config as any).module.rules[0].use[2].options).toEqual({ generateCss: true })
  })
})
