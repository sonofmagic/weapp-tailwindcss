import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { realpathSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  collectCssInlineSourceCandidates,
  createSourceScanPattern,
  createTailwindSourceEntryMatcher,
  expandInlineSourceCandidatePattern,
  expandTailwindSourceEntries,
  FULL_SOURCE_SCAN_EXTENSION_RE,
  isFileExcludedByTailwindSourceEntries,
  isFileMatchedByTailwindSourceEntries,
  normalizeLegacyContentEntries,
  parseConfigParam,
  parseSourceFileParam,
  postcss,
  resolveCssSourceEntries,
  resolveTailwindSourceEntry,
  toPosixPath,
} from '@/index'

describe('source scan helpers', () => {
  let tempDirs: string[] = []

  afterEach(async () => {
    await Promise.all(tempDirs.map(dir => rm(dir, { recursive: true, force: true })))
    tempDirs = []
  })

  async function createTempProject() {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'weapp-tw-source-scan-'))
    tempDirs.push(dir)
    await mkdir(path.join(dir, 'src/components'), { recursive: true })
    await mkdir(path.join(dir, 'dist'), { recursive: true })
    await writeFile(path.join(dir, 'src/index.vue'), '<template><view class="flex"></view></template>')
    await writeFile(path.join(dir, 'src/components/card.tsx'), 'export const cls = "text-sm"')
    await writeFile(path.join(dir, 'dist/ignored.vue'), '<view class="hidden"></view>')
    return dir
  }

  it('creates scan patterns and matches supported source extensions', () => {
    expect(createSourceScanPattern(['vue', 'ts'])).toBe('**/*.{vue,ts}')
    expect(FULL_SOURCE_SCAN_EXTENSION_RE.test('pages/index.uvue')).toBe(true)
    expect(FULL_SOURCE_SCAN_EXTENSION_RE.test('pages/index.md')).toBe(false)
    expect(toPosixPath(['a', 'b', 'c'].join(path.sep))).toBe('a/b/c')
  })

  it('normalizes legacy content entries with nested relative bases', () => {
    const base = '/repo'
    const relativeBase = '/repo/config'

    expect(normalizeLegacyContentEntries([
      './src/**/*.{vue,ts}',
      '!./dist/**',
      { files: ['./pages/**/*.vue'], relative: true },
      { files: ['./shared/**/*.ts'] },
      undefined,
    ], base, { relativeBase })).toEqual([
      { base, negated: false, pattern: 'src/**/*.{vue,ts}' },
      { base, negated: true, pattern: 'dist/**' },
      { base: relativeBase, negated: false, pattern: 'pages/**/*.vue' },
      { base, negated: false, pattern: 'shared/**/*.ts' },
    ])
  })

  it('parses config and source directive params', () => {
    expect(parseConfigParam('"./tailwind.config.ts"')).toBe('./tailwind.config.ts')
    expect(parseConfigParam('none')).toBeUndefined()
    expect(parseSourceFileParam('"./src"')).toEqual({ negated: false, sourcePath: './src' })
    expect(parseSourceFileParam('not "../legacy/**/*.vue"')).toEqual({ negated: true, sourcePath: '../legacy/**/*.vue' })
    expect(parseSourceFileParam('none')).toBeUndefined()
    expect(parseSourceFileParam('inline("flex")')).toBeUndefined()
  })

  it('resolves source entries for directories, absolute files, and glob prefixes', async () => {
    const dir = await createTempProject()
    const sourceFile = path.join(dir, 'src/index.vue')

    await expect(resolveTailwindSourceEntry('./src', dir, false, '**/*.vue')).resolves.toEqual({
      base: path.join(dir, 'src'),
      negated: false,
      pattern: '**/*.vue',
    })
    await expect(resolveTailwindSourceEntry(sourceFile, dir, false)).resolves.toEqual({
      base: path.dirname(sourceFile),
      negated: false,
      pattern: 'index.vue',
    })
    await expect(resolveTailwindSourceEntry('./src/**/*.{vue,tsx}', dir, true)).resolves.toEqual({
      base: path.join(dir, 'src'),
      negated: true,
      pattern: '**/*.{vue,tsx}',
    })
  })

  it('matches and excludes files with positive and negative source entries', async () => {
    const dir = await createTempProject()
    const entries = [
      { base: dir, negated: false, pattern: 'src/**/*.{vue,tsx}' },
      { base: dir, negated: true, pattern: 'src/components/**' },
    ]

    expect(isFileMatchedByTailwindSourceEntries(path.join(dir, 'src/index.vue'), entries)).toBe(true)
    expect(isFileMatchedByTailwindSourceEntries(path.join(dir, 'src/components/card.tsx'), entries)).toBe(false)
    expect(isFileExcludedByTailwindSourceEntries(path.join(dir, 'src/components/card.tsx'), entries)).toBe(true)
    expect(createTailwindSourceEntryMatcher(entries)?.(path.join(dir, 'src/index.vue'))).toBe(true)
    expect(createTailwindSourceEntryMatcher(undefined)).toBeUndefined()
  })

  it('resolves css @source directives into source entries', async () => {
    const dir = await createTempProject()
    const root = postcss.parse([
      '@source "./src";',
      '@source not "./dist/**";',
      '@source inline("flex text-sm");',
    ].join('\n'))

    await expect(resolveCssSourceEntries(root, dir, '**/*.vue')).resolves.toEqual([
      { base: path.join(dir, 'src'), negated: false, pattern: '**/*.vue' },
      { base: path.join(dir, 'dist'), negated: true, pattern: '**' },
    ])
  })

  it('expands source entries and applies ignore patterns', async () => {
    const dir = await createTempProject()

    const expanded = await expandTailwindSourceEntries([
      { base: dir, negated: false, pattern: 'src/**/*.{vue,tsx}' },
    ], {
      ignore: ['src/components/**'],
    })

    expect(expanded.map(file => realpathSync.native(file))).toEqual([
      realpathSync.native(path.join(dir, 'src/index.vue')),
    ])
  })

  it('expands inline source candidate patterns with nesting and numeric ranges', () => {
    expect(expandInlineSourceCandidatePattern('p-{1..3}')).toEqual(['p-1', 'p-2', 'p-3'])
    expect(expandInlineSourceCandidatePattern('m-{3..1..2}')).toEqual(['m-3', 'm-1'])
    expect(expandInlineSourceCandidatePattern('p-{1..3..-2}')).toEqual(['p-1', 'p-3'])
    expect(expandInlineSourceCandidatePattern('p-{1..3..0}')).toEqual([])
    expect(expandInlineSourceCandidatePattern('{hover:,focus:}text-{red,blue}-500')).toEqual([
      'hover:text-red-500',
      'focus:text-red-500',
      'hover:text-blue-500',
      'focus:text-blue-500',
    ])
    expect(expandInlineSourceCandidatePattern('text-{red')).toEqual(['text-{red'])
  })

  it('keeps inline source candidate separators inside brackets, quotes, and functions', () => {
    const root = postcss.parse([
      String.raw`@source inline("content-['hello world'] bg-[url(foo bar)] font-['Inter, sans-serif'] p-\{raw\}");`,
      String.raw`@source not inline("font-['Inter, sans-serif']");`,
      '@source inline(foo);',
    ].join('\n'))

    expect(collectCssInlineSourceCandidates(root)).toEqual({
      included: new Set([
        String.raw`content-['hello world']`,
        'bg-[url(foo bar)]',
        'p-\\raw\\',
      ]),
      excluded: new Set([String.raw`font-['Inter, sans-serif']`]),
    })
  })

  it('collects inline source candidates and removes excluded candidates', () => {
    const root = postcss.parse([
      '@source inline("flex text-{sm,lg} hover:bg-{red,blue}-500");',
      '@source not inline("text-sm hover:bg-blue-500");',
      '@source "./src";',
    ].join('\n'))

    expect(collectCssInlineSourceCandidates(root)).toEqual({
      included: new Set(['flex', 'text-lg', 'hover:bg-red-500']),
      excluded: new Set(['text-sm', 'hover:bg-blue-500']),
    })
  })
})
