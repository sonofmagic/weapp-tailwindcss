import { mkdir, mkdtemp, realpath, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { BenchmarkFixtureInfo } from './types'

const baseCandidates = [
  'block',
  'inline-block',
  'flex',
  'inline-flex',
  'grid',
  'hidden',
  'items-center',
  'items-start',
  'items-end',
  'justify-center',
  'justify-between',
  'content-center',
  'self-stretch',
  'place-items-center',
  'gap-2',
  'gap-4',
  'gap-x-3',
  'gap-y-5',
  'grid-cols-2',
  'grid-cols-3',
  'grid-cols-[1fr_2fr]',
  'w-4',
  'w-full',
  'w-[128rpx]',
  'w-[calc(100%-32rpx)]',
  'h-6',
  'h-screen',
  'min-h-[48rpx]',
  'max-w-[720rpx]',
  'p-2',
  'px-4',
  'py-[18rpx]',
  'm-1',
  'mt-[24rpx]',
  '-mx-2',
  'rounded',
  'rounded-[20rpx]',
  'border',
  'border-2',
  'border-[#123456]',
  'bg-white',
  'bg-black',
  'bg-slate-100',
  'bg-blue-500',
  'bg-[#07c160]',
  'bg-[color:var(--brand)]',
  'text-sm',
  'text-lg',
  'text-[28rpx]',
  'text-[#f8fafc]',
  'font-medium',
  'font-bold',
  'leading-6',
  'leading-[44rpx]',
  'tracking-wide',
  'opacity-75',
  'shadow',
  'shadow-[0_8rpx_24rpx_rgba(15,23,42,0.16)]',
  'overflow-hidden',
  'truncate',
  'relative',
  'absolute',
  'top-[12rpx]',
  'left-0',
  'z-10',
  'rotate-3',
  'rotate-[13deg]',
  'scale-95',
  'translate-x-[8rpx]',
  'transition',
  'duration-200',
  'ease-out',
  'hover:bg-blue-600',
  'hover:text-white',
  'active:scale-95',
  'focus-visible:outline',
  'disabled:opacity-50',
  'dark:bg-zinc-900',
  'dark:text-zinc-50',
  'first:mt-0',
  'last:mb-0',
  'odd:bg-slate-50',
  'even:bg-white',
  'sm:grid-cols-4',
  'md:px-8',
  'lg:max-w-5xl',
  'before:content-[""]',
  'after:block',
]

const require = createRequire(import.meta.url)

async function linkPackage(root: string, packageName: string) {
  const packageRoot = path.dirname(require.resolve(`${packageName}/package.json`))
  const linkPath = path.join(root, 'node_modules', packageName)
  await mkdir(path.dirname(linkPath), { recursive: true })
  await symlink(packageRoot, linkPath, 'dir')
}

export function createCandidateCorpus(classCount: number) {
  const candidates: string[] = []
  for (let index = 0; index < Math.max(1, classCount); index += 1) {
    const base = baseCandidates[index % baseCandidates.length]!
    candidates.push(base)
    if (index % 5 === 0) {
      candidates.push(`p-[${index + 1}rpx]`)
    }
    if (index % 7 === 0) {
      candidates.push(`bg-[#${(0x100000 + (index * 7919) % 0xefffff).toString(16).slice(0, 6)}]`)
    }
    if (index % 11 === 0) {
      candidates.push(`hover:translate-y-[${index + 2}rpx]`)
    }
  }
  return [...new Set(candidates)].slice(0, Math.max(1, classCount))
}

export function createBenchmarkCss(sourceGlob: string) {
  return [
    '@import "tailwindcss";',
    '@theme {',
    '  --color-brand: #155dfc;',
    '  --color-panel: #f8fafc;',
    '  --spacing-card: 32rpx;',
    '}',
    `@source "${sourceGlob}";`,
    '',
  ].join('\n')
}

function distribute<T>(items: T[], buckets: number) {
  const result = Array.from({ length: Math.max(1, buckets) }, () => [] as T[])
  for (let index = 0; index < items.length; index += 1) {
    result[index % result.length]!.push(items[index]!)
  }
  return result
}

export async function createBenchmarkFixture(options: {
  classCount: number
  sourceFiles: number
  prefix?: string
}): Promise<BenchmarkFixtureInfo> {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), options.prefix ?? 'weapp-tw-plugin-bench-')))
  const srcDir = path.join(root, 'src')
  const sourcesDir = path.join(srcDir, 'sources')
  await mkdir(sourcesDir, { recursive: true })
  await linkPackage(root, 'tailwindcss')

  const candidates = createCandidateCorpus(options.classCount)
  const appendedCandidates = createCandidateCorpus(Math.max(12, Math.floor(options.classCount / 5)))
    .map(candidate => candidate.startsWith('hover:') ? candidate : `hover:${candidate}`)
    .slice(0, 24)

  const chunks = distribute(candidates, options.sourceFiles)
  await Promise.all(chunks.map((chunk, index) => {
    const body = chunk.map((className, itemIndex) => (
      `<div class="${className} data-${index}-${itemIndex}">${className}</div>`
    )).join('\n')
    return writeFile(path.join(sourcesDir, `fixture-${index}.html`), body, 'utf8')
  }))

  const cssEntry = path.join(srcDir, 'style.css')
  const mainEntry = path.join(srcDir, 'main.ts')
  const htmlEntry = path.join(root, 'index.html')
  await writeFile(cssEntry, createBenchmarkCss('./sources/**/*.{html,ts}'), 'utf8')
  await writeFile(mainEntry, [
    'import "./style.css"',
    'export const marker = "tailwindcss-plugin-compare"',
    '',
  ].join('\n'), 'utf8')
  await writeFile(htmlEntry, [
    '<!doctype html>',
    '<html>',
    '<head><meta charset="UTF-8"><title>Tailwind Benchmark</title></head>',
    '<body><div id="app"></div><script type="module" src="/src/main.ts"></script></body>',
    '</html>',
  ].join('\n'), 'utf8')

  return {
    root,
    cssEntry,
    htmlEntry,
    mainEntry,
    sourcesDir,
    candidates,
    appendedCandidates,
  }
}
