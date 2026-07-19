import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { clearTailwindPatchTaskCache, discoverTailwindV4CssEntries, twExtract } from './shared'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { force: true, recursive: true })))
})

describe('Tailwind v4 patch extraction', () => {
  it('discovers explicit Tailwind CSS entries without reading build outputs', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-v4-css-entry-'))
    tempDirs.push(root)
    await Promise.all([
      mkdir(path.join(root, 'src'), { recursive: true }),
      mkdir(path.join(root, 'dist'), { recursive: true }),
    ])
    await Promise.all([
      writeFile(path.join(root, 'src/app.css'), '@import "tailwindcss" source(none);\n', 'utf8'),
      writeFile(path.join(root, 'src/plain.css'), '.plain { color: red; }\n', 'utf8'),
      writeFile(path.join(root, 'dist/stale.css'), '@import "tailwindcss";\n', 'utf8'),
    ])

    await expect(discoverTailwindV4CssEntries(root)).resolves.toEqual([
      path.join(root, 'src/app.css'),
    ])
  })

  it('extracts source-aware candidates through Tailwind v4 design systems', async () => {
    const root = path.resolve(__dirname, '../demo/gulp-tailwindcss-v4')
    clearTailwindPatchTaskCache(root)

    const result = await twExtract(root)

    expect(result?.classList).toContain('px-[29rpx]')
    expect(result?.classList).toContain('before:content-[\'normal_subpackage_gulp-tailwindcss-v4\']')
    expect(result?.classList).not.toEqual([])
  })

  it('keeps configured t-class candidates in Vue source entries', async () => {
    const root = path.resolve(__dirname, '../demo/taro-vite-vue3-tailwindcss-v4')
    clearTailwindPatchTaskCache(root)

    const result = await twExtract(root)

    expect(result?.classList).toContain('bg-[#0977ee]')
    expect(result?.classList).toContain('text-[31rpx]')
    expect(result?.classList).toContain('px-[29rpx]')
  })
})
