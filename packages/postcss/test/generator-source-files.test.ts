import { realpathSync } from 'node:fs'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import postcss from 'postcss'
import { afterEach, describe, expect, it } from 'vitest'
import { collectAutoTailwindCandidates, collectPostcssLocalSources } from '../src/generator-plugin/source-files'

describe('generator source files', () => {
  let tempDirs: string[] = []

  afterEach(async () => {
    await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })))
    tempDirs = []
  })

  async function createTempProject() {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-generator-sources-'))
    tempDirs.push(dir)
    await mkdir(path.join(dir, 'src/components'), { recursive: true })
    await mkdir(path.join(dir, 'ignored'), { recursive: true })
    await writeFile(path.join(dir, 'src/index.vue'), '<template><view class="flex text-sm"></view></template>')
    await writeFile(path.join(dir, 'src/components/card.ts'), 'export const cls = "rounded-[28rpx] bg-slate-900"')
    await writeFile(path.join(dir, 'ignored/index.vue'), '<view class="hidden"></view>')
    return dir
  }

  async function createPostcssResult(css: string, from: string) {
    return postcss().process(css, {
      from,
    })
  }

  it('collects local source files from reused source entries without reparsing css source directives', async () => {
    const dir = await createTempProject()
    const result = await createPostcssResult('@source "./ignored";', path.join(dir, 'src/tailwind.css'))

    const collected = await collectPostcssLocalSources(result.root, result, {}, {
      sourceEntries: [
        { base: path.join(dir, 'src'), negated: false, pattern: '**/*.{vue,ts}' },
        { base: dir, negated: true, pattern: 'ignored/**' },
      ],
    })

    expect(collected.files.map(file => realpathSync.native(file)).sort()).toEqual([
      realpathSync.native(path.join(dir, 'src/components/card.ts')),
      realpathSync.native(path.join(dir, 'src/index.vue')),
    ])
    expect(collected.sources.sort((a, b) => a.extension?.localeCompare(b.extension ?? '') ?? 0)).toEqual([
      {
        content: 'export const cls = "rounded-[28rpx] bg-slate-900"',
        extension: 'ts',
      },
      {
        content: '<template><view class="flex text-sm"></view></template>',
        extension: 'vue',
      },
    ])
  })

  it('collects candidates from reused source entries and applies inline include/exclude directives', async () => {
    const dir = await createTempProject()
    const result = await createPostcssResult([
      '/* source(none) */',
      '@source inline("inline-flex px-4");',
      '@source not inline("text-sm");',
    ].join('\n'), path.join(dir, 'src/tailwind.css'))

    const candidates = await collectAutoTailwindCandidates(result.root, result, {}, {
      css: result.css,
      sourceEntries: [
        { base: path.join(dir, 'src'), negated: false, pattern: '**/*.{vue,ts}' },
      ],
    })

    expect(candidates).toEqual(new Set([
      'flex',
      'rounded-[28rpx]',
      'inline-flex',
      'px-4',
    ]))
  })

  it('does not scan sources when scanSources is disabled', async () => {
    const dir = await createTempProject()
    const result = await createPostcssResult('@source inline("flex");', path.join(dir, 'src/tailwind.css'))

    await expect(collectAutoTailwindCandidates(result.root, result, {
      scanSources: false,
    }, {
      sourceEntries: [
        { base: path.join(dir, 'src'), negated: false, pattern: '**/*.{vue,ts}' },
      ],
    })).resolves.toEqual(new Set())
  })

  it('skips default auto scan for Tailwind v4 apply-only css and keeps inline candidates', async () => {
    const dir = await createTempProject()
    const result = await createPostcssResult([
      '@import "tailwindcss" source(none);',
      '@source inline("font-bold");',
      '.card { @apply flex; }',
    ].join('\n'), path.join(dir, 'src/tailwind.css'))

    const candidates = await collectAutoTailwindCandidates(result.root, result, {}, {
      base: path.resolve(__dirname, '..'),
      css: result.css,
      sourceEntries: [],
    })

    expect(candidates).toEqual(new Set(['font-bold']))
  })

  it('includes extension-less source files without an extension hint', async () => {
    const dir = await createTempProject()
    const sourceFile = path.join(dir, 'src/ClassNames')
    await writeFile(sourceFile, 'export const cls = "gap-3"')
    const result = await createPostcssResult('/* source(none) */', path.join(dir, 'src/tailwind.css'))

    const collected = await collectPostcssLocalSources(result.root, result, {}, {
      sourceEntries: [
        { base: path.join(dir, 'src'), negated: false, pattern: 'ClassNames' },
      ],
    })

    expect(collected.sources).toEqual([
      {
        content: 'export const cls = "gap-3"',
      },
    ])
  })

  it('collects legacy Tailwind config content files from options and css directives', async () => {
    const dir = await createTempProject()
    const configDir = path.join(dir, 'config')
    const directiveConfigDir = path.join(dir, 'directive-config')
    await mkdir(path.join(configDir, 'pages'), { recursive: true })
    await mkdir(path.join(directiveConfigDir, 'widgets'), { recursive: true })
    await writeFile(path.join(configDir, 'pages/home.vue'), '<view class="mt-4"></view>')
    await writeFile(path.join(directiveConfigDir, 'widgets/card.ts'), 'export const cls = "mb-2"')
    const configPath = path.join(configDir, 'tailwind.config.cjs')
    const directiveConfigPath = path.join(directiveConfigDir, 'tailwind.config.cjs')
    await writeFile(configPath, [
      'module.exports = {',
      '  content: { relative: true, files: ["./pages/**/*.vue"] }',
      '}',
    ].join('\n'))
    await writeFile(directiveConfigPath, [
      'module.exports = {',
      '  content: ["./widgets/**/*.ts"]',
      '}',
    ].join('\n'))
    const result = await createPostcssResult(`@config "${directiveConfigPath}";`, path.join(dir, 'src/tailwind.css'))

    const collected = await collectPostcssLocalSources(result.root, result, {
      config: configPath,
    }, {
      sourceEntries: [],
    })

    expect(collected.files.map(file => realpathSync.native(file)).sort()).toEqual([
      realpathSync.native(path.join(configDir, 'pages/home.vue')),
      realpathSync.native(configPath),
      realpathSync.native(path.join(directiveConfigDir, 'widgets/card.ts')),
      realpathSync.native(directiveConfigPath),
    ].sort())
    expect(collected.sources.map(source => source.content).sort()).toEqual([
      '<view class="mt-4"></view>',
      'export const cls = "mb-2"',
    ])
  })
})
