import fs from 'node:fs'
import path from 'node:path'
import { getVirtualModuleCode, VIRTUAL_MANIFEST_MODULE, withWeappTailwindcss } from '@/metro'

describe('Expo Metro integration', () => {
  it('registers CSS and resolves the watched virtual manifest module', () => {
    const config = withWeappTailwindcss({ resolver: { sourceExts: ['js'] } }, {
      css: '.flex { display: flex; }',
      classSet: ['flex'],
    })
    expect(config.resolver?.sourceExts).toEqual(['js', 'css'])
    const resolved = config.resolver?.resolveRequest?.({}, VIRTUAL_MANIFEST_MODULE, 'ios') as { type: string, filePath: string }
    expect(resolved.type).toBe('sourceFile')
    expect(fs.existsSync(resolved.filePath)).toBe(true)
    expect(config.watchFolders).toContain(path.dirname(resolved.filePath))
    expect(getVirtualModuleCode(resolved.filePath)).toContain('"display":"flex"')
  })

  it('accepts an async Expo config factory', async () => {
    const config = await withWeappTailwindcss(async () => ({ resolver: { sourceExts: ['js'] } }), {
      css: '.flex { display: flex; }',
      classSet: ['flex'],
    })
    expect(config.resolver?.sourceExts).toEqual(['js', 'css'])
  })
})
