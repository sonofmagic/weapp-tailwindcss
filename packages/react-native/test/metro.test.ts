import fs from 'node:fs'
import path from 'node:path'
import { getRegisteredManifest, getVirtualModuleCode, VIRTUAL_MANIFEST_MODULE, withWeappTailwindcss } from '@/metro'

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
})
