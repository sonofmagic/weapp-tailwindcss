import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { postcss } from '@weapp-tailwindcss/postcss'
import { describe, expect, it, vi } from 'vitest'
import { captureFrameworkPostcssOptions } from '@/bundlers/shared/framework-postcss'
import { generateTailwindV4Css } from '@/bundlers/shared/v4-generation-core'
import { getCompilerContext } from '@/context'

describe('framework CSS composition', () => {
  it.each(['legacy', 'graph'] as const)('merges imported and bundled CSS only after framework conversion (%s)', async (mode) => {
    vi.stubEnv('WEAPP_TAILWINDCSS_COMPILER', mode)
    const directory = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-framework-css-'))
    try {
      const file = path.join(directory, 'entry.css')
      const vendor = '.vendor{width:16px;--framework-pass:0}.vendor-alt{height:24px;-webkit-transform:translateY(-50%);transform:translateY(-50%)}'
      const source = '@import "./vendor.css";\n@tailwind utilities;'
      await writeFile(path.join(directory, 'vendor.css'), vendor)
      await writeFile(file, source)
      const opts = getCompilerContext({
        tailwindcssBasedir: process.cwd(),
        generator: { target: 'weapp' },
        cssPreflight: false,
      })
      const framework = {
        postcssPlugin: 'test-framework-units',
        Once(root: postcss.Root) {
          root.walkDecls((declaration) => {
            declaration.value = declaration.prop === '--framework-pass'
              ? String(Number(declaration.value) + 1)
              : declaration.value.replace(/(?<=\d)px\b/g, 'rpx')
          })
        },
      }
      captureFrameworkPostcssOptions(opts, { plugins: [framework] })
      const processedVendor = (await postcss([framework]).process(vendor, { from: file })).css
      const result = await generateTailwindV4Css({
        opts,
        runtimeState: {
          tailwindRuntime: opts.tailwindRuntime,
          readyPromise: Promise.resolve(),
        },
        runtime: new Set(['flex']),
        rawSource: source,
        userRawSource: '.raw-user{height:10px}',
        frameworkProcessedUserCss: `.before{width:1rpx}\n@media source(none){/*! weapp-tailwindcss generator-placeholder */}\n:root{--spacing:.25rem}${processedVendor}\n.vendor{width:32rpx}.bundle-only{height:8rpx;--framework-pass:1}`,
        file,
        cssStage: 'framework-processed',
        cssHandlerOptions: { majorVersion: 4, isMainChunk: false, sourceOptions: { cssEntries: [file], sourceFile: file } },
        cssUserHandlerOptions: { majorVersion: 4, isMainChunk: false },
        styleHandler: opts.styleHandler,
        debug: () => {},
        restoreLocalCssImports: false,
      })
      expect(result).toBeDefined()
      const root = postcss.parse(result!.css)
      const widths: string[] = []
      root.walkRules('.vendor', (rule) => {
        rule.walkDecls('width', (declaration) => { widths.push(declaration.value) })
      })
      expect(widths).toEqual(['16rpx', '32rpx'])
      const alternatives: string[] = []
      root.walkRules('.vendor-alt', rule => { alternatives.push(rule.toString()) })
      expect(alternatives).toHaveLength(1)
      expect(result!.css).toContain('.bundle-only')
      const passes: string[] = []
      root.walkDecls('--framework-pass', (declaration) => { passes.push(declaration.value) })
      expect(passes).toEqual(['1', '1'])
      expect(result!.css).toMatch(/\.raw-user\s*\{\s*height:\s*10rpx/)
      expect(result!.css.indexOf('.before')).toBeLessThan(result!.css.indexOf('.vendor'))
      expect(result!.css).toContain('.flex')
      expect(result!.css).not.toMatch(/(?<=\d)px\b/)
      expect(result!.css).not.toContain('--spacing:.25rem')
    }
    finally {
      vi.unstubAllEnvs()
      await rm(directory, { recursive: true, force: true })
    }
  })
})
