import { mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'

const createdDirs: string[] = []

async function createTempDir(prefix: string) {
  const dir = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`)
  await mkdir(dir, { recursive: true })
  createdDirs.push(dir)
  return dir
}

async function writeTempFile(file: string, content: string) {
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, content, 'utf8')
}

describe('bundlers/vite source candidates', () => {
  afterEach(async () => {
    vi.resetModules()
    vi.restoreAllMocks()
    await Promise.all(
      createdDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })),
    )
  })

  it('reuses extracted candidates for identical source content', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()
    const source = '<view class="text-[23px] bg-[#123456]"></view>'

    await collector.sync('/project/pages/index.wxml', source)
    await collector.sync('/project/sub/pages/index.wxml', source)

    expect(collector.values()).toEqual(new Set(['text-[23px]', 'bg-[#123456]']))
  })

  it('collects complex arbitrary source candidates with the lightweight HMR extractor', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()

    await collector.sync('/project/pages/index.wxml', [
      '<view class="w-[calc(100%_-_32px)] bg-[rgb(12,34,56)]">',
      '  <view class="group-[:nth-of-type(3)_&]:block [mask-type:luminance]"></view>',
      '</view>',
    ].join('\n'))

    const values = collector.values()
    expect(values.has('w-[calc(100%_-_32px)]')).toBe(true)
    expect(values.has('bg-[rgb(12,34,56)]')).toBe(true)
    expect(values.has('group-[:nth-of-type(3)_&]:block')).toBe(true)
    expect(values.has('[mask-type:luminance]')).toBe(true)
  })

  it('does not collect html tag fragments from JavaScript template strings', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()

    await collector.sync(
      '/project/src/index.js',
      'document.body.append(`<div class="${className}">className</div>`)'
      + '\nconst className = "flex bg-yellow-300/30 w-[100px]"',
    )

    const values = collector.values()
    expect(values).toEqual(new Set(['flex', 'bg-yellow-300/30', 'w-[100px]']))
  })

  it('merges transformed module candidates without dropping raw source candidates', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()
    const id = '/project/src/pages/index.tsx'

    await collector.sync(id, '<view class="bg-[#112233]"></view>')
    await collector.merge(id, 'export const cls = "text-[188rpx]"')

    expect(collector.values()).toEqual(new Set(['bg-[#112233]', 'text-[188rpx]']))
  })

  it('matches updated relative-path files against absolute @source entries', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()

    await collector.sync('src/pages/index.vue', '<view class="bg-[#000020] text-[23.000020px]"></view>')

    expect(collector.valuesForEntries([{
      base: process.cwd(),
      negated: false,
      pattern: 'src/**/*',
    }])).toEqual(new Set(['bg-[#000020]', 'text-[23.000020px]']))
  })

  it.each(['vue', 'uvue', 'nvue'])('collects %s template and script source candidates through tailwindcss-patch', async (extension) => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()

    await collector.sync(`src/pages/index.${extension}`, [
      '<template><view class="bg-[#000020] text-[23.000020px]"></view></template>',
      '<script setup>',
      'const className = "flex w-[100px]"',
      '</script>',
    ].join('\n'))

    expect(collector.values()).toEqual(new Set([
      'bg-[#000020]',
      'text-[23.000020px]',
      'flex',
      'w-[100px]',
    ]))
  })

  it('matches absolute source entry patterns against tracked source files', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const collector = createSourceCandidateCollector()
    const root = '/project'
    const file = '/project/src/index.js'

    await collector.sync(file, 'export const cls = "flex grid w-[100px]"')

    expect(collector.valuesForEntries([{
      base: root,
      negated: false,
      pattern: '/project/src/*.{js,html,wxml}',
    }])).toEqual(new Set(['flex', 'grid', 'w-[100px]']))
  })

  it('uses Tailwind v4 scanner defaults for root source discovery', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const root = await createTempDir('weapp-tw-vite-scanner-defaults')
    await writeTempFile(path.join(root, '.gitignore'), 'ignored-by-gitignore.js\n')
    await writeTempFile(path.join(root, 'src/page.wxml'), '<view class="bg-[#112233]"></view>')
    await writeTempFile(path.join(root, 'node_modules/pkg/index.js'), 'export const cls = "text-[#111111]"')
    await writeTempFile(path.join(root, 'ignored-by-gitignore.js'), 'export const cls = "text-[#222222]"')
    await writeTempFile(path.join(root, 'src/ignored.scss'), '.btn { @apply text-[#333333]; }')
    await writeTempFile(path.join(root, 'package-lock.json'), '{"class":"text-[#444444]"}')

    const collector = createSourceCandidateCollector()
    await collector.scanRoot({ root })

    expect(collector.values()).toEqual(new Set(['bg-[#112233]']))
  })

  it('lets explicit Tailwind v4 source patterns include default ignored extensions', async () => {
    const { createSourceCandidateCollector } = await import('@/bundlers/vite/source-candidates')
    const root = await createTempDir('weapp-tw-vite-scanner-explicit-source')
    await writeTempFile(path.join(root, 'src/explicit.scss'), '.btn { @apply text-[#333333]; }')

    const collector = createSourceCandidateCollector()
    await collector.scanRoot({
      root,
      entries: [{
        base: path.join(root, 'src'),
        pattern: 'explicit.scss',
        negated: false,
      }],
    })

    expect(collector.values()).toEqual(new Set(['text-[#333333]']))
  })
})
