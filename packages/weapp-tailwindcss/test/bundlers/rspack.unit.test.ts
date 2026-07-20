import { describe, expect, it } from 'vitest'
import { patchRspackConfig } from '@/rspack'

function getUseLoaders(config: any) {
  return config.module.rules[0].oneOf[0].use.map((item: any) => item.loader)
}

describe('bundlers/rspack patchRspackConfig', () => {
  it('injects css rewrite loader after lightning css loader without removing it', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                use: [
                  { loader: 'css-extract-loader' },
                  { loader: 'css-loader' },
                  { loader: 'builtin:lightningcss-loader' },
                ],
              },
            ],
          },
        ],
      },
    }

    patchRspackConfig(config, {
      cssImportRewriteLoader: {
        loader: '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
      },
    })

    expect(getUseLoaders(config)).toEqual([
      'css-extract-loader',
      'css-loader',
      'builtin:lightningcss-loader',
      '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
    ])
  })

  it('can remove lightning css loader explicitly', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                use: [
                  { loader: 'css-loader' },
                  { loader: 'builtin:lightningcss-loader' },
                ],
              },
            ],
          },
        ],
      },
    }

    patchRspackConfig(config, {
      removeLightningCssLoader: true,
      cssImportRewriteLoader: false,
    })

    expect(getUseLoaders(config)).toEqual(['css-loader'])
  })

  it('moves an existing rewrite loader after lightning css loader', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                use: [
                  { loader: 'css-loader' },
                  {
                    loader: '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
                    options: {
                      tailwindcssImportRewriteRuntimeKey: 'legacy',
                    },
                  },
                  { loader: 'builtin:lightningcss-loader' },
                ],
              },
            ],
          },
        ],
      },
    }

    patchRspackConfig(config)

    expect(getUseLoaders(config)).toEqual([
      'css-loader',
      'builtin:lightningcss-loader',
      '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
    ])
  })

  it('does not inject css rewrite loader into non-css rules', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                use: [
                  { loader: 'builtin:swc-loader' },
                ],
              },
            ],
          },
        ],
      },
    }

    patchRspackConfig(config)

    expect(getUseLoaders(config)).toEqual(['builtin:swc-loader'])
  })
})
