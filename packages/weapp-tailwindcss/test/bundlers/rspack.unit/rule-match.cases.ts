import { describe, expect, it, vi } from 'vitest'
import { patchRspackConfig } from '@/rspack'
import { getUseLoaders } from './shared'

describe('bundlers/rspack patchRspackConfig rule matching', () => {
  it('does not patch non-css rules even when their loader names contain css anchors', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                test: /\.[jt]sx?$/,
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
      cssImportRewriteLoader: {
        loader: '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
      },
    })

    expect(getUseLoaders(config)).toEqual([
      'css-loader',
      'builtin:lightningcss-loader',
    ])
  })

  it('patches css rules identified by test metadata', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                test: /\.css$/,
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
      cssImportRewriteLoader: {
        loader: '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
      },
    })

    expect(getUseLoaders(config)).toEqual([
      'css-loader',
      'builtin:lightningcss-loader',
      '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
    ])
  })

  it('patches style rules identified by resourceQuery metadata', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                resourceQuery: /type=style/,
                use: [
                  { loader: 'postcss-loader' },
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
      'postcss-loader',
      '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
    ])
  })

  it('skips style rules excluded by static exclude metadata', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                test: /\.css$/,
                exclude: /\.css$/,
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
      cssImportRewriteLoader: {
        loader: '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
      },
    })

    expect(getUseLoaders(config)).toEqual([
      'css-loader',
      'builtin:lightningcss-loader',
    ])
  })

  it('keeps directory include constraints as loader-anchor fallback', () => {
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                include: /src/,
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
      cssImportRewriteLoader: {
        loader: '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
      },
    })

    expect(getUseLoaders(config)).toEqual([
      'css-loader',
      'builtin:lightningcss-loader',
      '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
    ])
  })

  it('supports compound rule conditions without executing functions', () => {
    const resourceQuery = vi.fn(() => true)
    const config = {
      module: {
        rules: [
          {
            oneOf: [
              {
                test: {
                  and: [
                    /\.css$/,
                    { not: /\.module\.css$/ },
                  ],
                },
                resourceQuery,
                use: [
                  { loader: 'postcss-loader' },
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

    expect(resourceQuery).not.toHaveBeenCalled()
    expect(getUseLoaders(config)).toEqual([
      'postcss-loader',
      '/virtual/weapp-tw-css-import-rewrite-loader.cjs',
    ])
  })
})
