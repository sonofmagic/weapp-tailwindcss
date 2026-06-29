import type { OutputAsset } from 'rollup'
import { describe, expect, it } from 'vitest'
import { createStyleInjector } from 'weapp-style-injector'
import { weappStyleInjector } from 'weapp-style-injector/vite'

function asset(fileName: string, source: string): OutputAsset {
  return {
    type: 'asset',
    fileName,
    name: fileName,
    names: [fileName],
    originalFileName: null,
    originalFileNames: [],
    source,
    needsCodeReference: false,
  }
}

async function runViteStyleInjector(bundle: Record<string, OutputAsset>, options: Parameters<typeof weappStyleInjector>[0]) {
  const plugin = weappStyleInjector(options)
  const hook = plugin.generateBundle
  const handler = typeof hook === 'function' ? hook : hook?.handler
  await handler?.call({
    emitFile(file: { type: 'asset', fileName?: string, source?: string | Uint8Array }) {
      if (file.type === 'asset' && file.fileName) {
        bundle[file.fileName] = asset(file.fileName, String(file.source ?? ''))
      }
      return file.fileName ?? ''
    },
  } as any, {} as any, bundle as any, false)
}

describe('style-injector core', () => {
  it('handles imports, per-file imports, include, exclude and dedupe', () => {
    const injector = createStyleInjector({
      imports: ['shared.wxss', 'shared.wxss'],
      perFileImports: file => file === 'pages/index.wxss' ? ['page.wxss'] : [],
      include: ['**/*.wxss'],
      exclude: ['**/ignored.wxss'],
    })

    expect(injector.inject('pages/index.wxss', '@import "shared.wxss";\n.page{}')).toEqual({
      changed: true,
      content: '@import "page.wxss";\n@import "shared.wxss";\n.page{}',
    })
    expect(injector.shouldProcess('pages/ignored.wxss')).toBe(false)
    expect(injector.shouldProcess('pages/index.js')).toBe(false)
  })

  it('can disable dedupe', () => {
    const injector = createStyleInjector({
      imports: ['shared.wxss'],
      dedupe: false,
    })

    expect(injector.inject('app.wxss', '@import "shared.wxss";').content).toBe([
      '@import "shared.wxss";',
      '@import "shared.wxss";',
    ].join('\n'))
  })
})

describe('style-injector vite adapter', () => {
  it('injects imports into vite bundle assets only', async () => {
    const bundle = {
      'app.wxss': asset('app.wxss', '.app{}'),
      'app.js': {
        type: 'chunk',
        fileName: 'app.js',
        name: 'app',
        code: 'console.log(1)',
      } as any,
    }

    await runViteStyleInjector(bundle as any, {
      imports: ['shared.wxss'],
    })

    expect(bundle['app.wxss'].source).toBe('@import "shared.wxss";\n.app{}')
    expect((bundle['app.js'] as any).code).toBe('console.log(1)')
  })
})
