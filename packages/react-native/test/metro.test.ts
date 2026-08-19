import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { getRegisteredManifest, getVirtualModuleCode, VIRTUAL_MANIFEST_MODULE, withWeappTailwindcss } from '@/metro'
import { transform } from '@/metro-transformer'

describe('Expo Metro integration', () => {
  it('registers CSS and resolves the watched virtual manifest module', async () => {
    const config = withWeappTailwindcss({ resolver: { sourceExts: ['js'] } }, {
      css: '.flex { display: flex; }',
      classSet: ['flex'],
    })
    expect(config.resolver?.sourceExts).toEqual(['js', 'css'])
    const resolved = config.resolver?.resolveRequest?.({}, VIRTUAL_MANIFEST_MODULE, 'ios') as { type: string, filePath: string }
    expect(resolved.type).toBe('sourceFile')
    expect(fs.existsSync(resolved.filePath)).toBe(true)
    expect(config.watchFolders).toContain(path.dirname(resolved.filePath))
    expect(config.transformerPath).toContain('metro-transformer')
    expect(getVirtualModuleCode(resolved.filePath)).toContain('"display":"flex"')
    expect(getVirtualModuleCode(resolved.filePath)).toContain('setStyleSheetFactory(StyleSheet.create)')
    const id = (config.transformer as Record<string, unknown>).weappTailwindcssMetroId as string
    expect((config.transformer as Record<string, unknown>).weappTailwindcssManifestPath).toContain('.manifest.json')
    await expect(getRegisteredManifest(id)).resolves.toMatchObject({ staticLookup: { flex: expect.any(Array) } })
  })

  it('accepts an async Expo config factory', async () => {
    const config = await withWeappTailwindcss(async () => ({ resolver: { sourceExts: ['js'] } }), {
      css: '.flex { display: flex; }',
      classSet: ['flex'],
    })
    expect(config.resolver?.sourceExts).toEqual(['js', 'css'])
  })

  it('anchors dependencies imported by the temporary virtual module to projectRoot', () => {
    const projectRoot = path.resolve('fixtures/react-native-app')
    let resolvedOrigin = ''
    const config = withWeappTailwindcss({
      resolver: {
        sourceExts: ['js'],
        resolveRequest(context) {
          resolvedOrigin = (context as { originModulePath: string }).originModulePath
          return { type: 'empty' }
        },
      },
    }, {
      projectRoot,
      css: '.flex { display: flex; }',
      classSet: ['flex'],
    })
    const virtual = config.resolver?.resolveRequest?.({}, VIRTUAL_MANIFEST_MODULE, 'android') as { filePath: string }

    config.resolver?.resolveRequest?.({ originModulePath: virtual.filePath }, 'react-native', 'android')

    expect(resolvedOrigin).toBe(path.join(projectRoot, 'package.json'))
  })

  it('passes the virtual manifest through the original Expo transformer', async () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'weapp-tailwindcss-rn-transformer-'))
    try {
      const transformerPath = path.join(temporaryRoot, 'transformer.cjs')
      fs.writeFileSync(transformerPath, `exports.transform = (_config, _root, filename, data) => ({ filename, code: data.toString(), dependencies: ['react-native'] })\n`)
      const config = withWeappTailwindcss({ transformerPath }, {
        projectRoot: temporaryRoot,
        css: '.flex { display: flex; }',
        classSet: ['flex'],
      })
      const virtual = config.resolver?.resolveRequest?.({}, VIRTUAL_MANIFEST_MODULE, 'ios') as { filePath: string }
      const result = await transform(config.transformer ?? {}, temporaryRoot, virtual.filePath, Buffer.from('untransformed'), {}) as { code: string, dependencies: string[] }

      expect(result.code).toContain('setManifest(')
      expect(result.code).not.toContain('untransformed')
      expect(result.dependencies).toEqual(['react-native'])
    }
    finally {
      fs.rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })

  it('waits for the registered manifest when Metro omits its custom id', async () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'weapp-tailwindcss-rn-manifest-path-'))
    try {
      const transformerPath = path.join(temporaryRoot, 'transformer.cjs')
      fs.writeFileSync(transformerPath, `exports.transform = (_config, _root, filename, data) => ({ filename, code: data.toString(), dependencies: [] })\n`)
      const config = withWeappTailwindcss({ transformerPath }, {
        projectRoot: temporaryRoot,
        css: '.flex { display: flex; }',
        classSet: ['flex'],
      })
      const transformerConfig = { ...(config.transformer ?? {}) } as Record<string, unknown>
      delete transformerConfig.weappTailwindcssMetroId
      const result = await transform(transformerConfig, temporaryRoot, path.join(temporaryRoot, 'Screen.tsx'), Buffer.from('<View className="flex" />'), {}) as { code: string }

      expect(result.code).toMatch(/_twStatic\(\["s[a-z0-9]+"\]\)/)
      expect(result.code).not.toContain('className')
    }
    finally {
      fs.rmSync(temporaryRoot, { recursive: true, force: true })
    }
  })
})
