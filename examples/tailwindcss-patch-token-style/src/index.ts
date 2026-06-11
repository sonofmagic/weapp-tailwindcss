import type { TailwindV4CandidateSource } from 'tailwindcss-patch'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import {
  createTailwindV4Engine,
  extractSourceCandidates,
  resolveTailwindV4Source,
} from 'tailwindcss-patch'

export interface DemoSource extends Required<TailwindV4CandidateSource> {
  file: string
}

export interface TokenStyleResult {
  tokens: string[]
  classSet: string[]
  css: string
  dependencies: string[]
  sources: Array<{
    base: string
    pattern: string
    negated: boolean
  }>
  root: unknown
}

export interface RunDemoOptions {
  projectRoot?: string
  outputRoot?: string
}

export const demoSources: DemoSource[] = [
  {
    file: 'pages/index.tsx',
    extension: 'tsx',
    content: `
      export function IndexPage() {
        const active = true
        return (
          <view className="min-h-screen bg-slate-950 px-6 py-8 text-white">
            <view className={active ? 'rounded-2xl bg-emerald-500/90 p-4 shadow-lg shadow-emerald-500/25' : 'opacity-60'}>
              <text className="text-[32px] font-semibold leading-tight tracking-normal">tailwindcss-patch</text>
              <text className="mt-2 block text-sm text-emerald-50">extract tokens, then generate CSS</text>
            </view>
          </view>
        )
      }
    `,
  },
  {
    file: 'components/card.ts',
    extension: 'ts',
    content: `
      export const cardClass = [
        'mt-4',
        'grid',
        'grid-cols-2',
        'gap-3',
        'rounded-[18px]',
        'border',
        'border-white/15',
        'bg-[linear-gradient(135deg,#0f172a_0%,#134e4a_100%)]',
        'p-3',
      ].join(' ')
    `,
  },
  {
    file: 'styles/button.css',
    extension: 'css',
    content: `
      .primary-button {
        @apply inline-flex items-center justify-center rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950;
      }
    `,
  },
]

function sortValues(values: Iterable<string>) {
  return [...new Set(values)].sort((a, z) => a.localeCompare(z))
}

export async function collectCandidatesFromSources(sources: DemoSource[]) {
  const candidates = new Set<string>()
  for (const source of sources) {
    const extracted = await extractSourceCandidates(source.content, source.extension, {
      bareArbitraryValues: true,
    })
    for (const candidate of extracted) {
      candidates.add(candidate)
    }
  }
  return candidates
}

export async function generateStyleFromCandidates(
  candidates: Iterable<string>,
  projectRoot = process.cwd(),
): Promise<TokenStyleResult> {
  const source = await resolveTailwindV4Source({
    projectRoot,
    cwd: projectRoot,
    css: [
      '@import "tailwindcss/theme.css" layer(theme);',
      '@import "tailwindcss/utilities.css" layer(utilities);',
    ].join('\n'),
  })
  const engine = createTailwindV4Engine(source)
  const result = await engine.generate({
    bareArbitraryValues: true,
    candidates,
    scanSources: false,
  })
  return {
    tokens: sortValues(candidates),
    classSet: sortValues(result.classSet),
    css: result.css,
    dependencies: result.dependencies,
    sources: result.sources,
    root: result.root,
  }
}

async function writeDemoResult(result: TokenStyleResult, outputRoot = process.cwd()) {
  const outputDir = path.resolve(outputRoot, 'dist')
  await mkdir(outputDir, { recursive: true })
  await writeFile(
    path.join(outputDir, 'tokens.json'),
    `${JSON.stringify({
      tokens: result.tokens,
      classSet: result.classSet,
      dependencies: result.dependencies,
      sources: result.sources,
      root: result.root,
    }, null, 2)}\n`,
  )
  await writeFile(path.join(outputDir, 'style.css'), result.css)
}

export async function runDemo(options: RunDemoOptions = {}) {
  const projectRoot = options.projectRoot ?? process.cwd()
  const outputRoot = options.outputRoot ?? projectRoot
  const candidates = await collectCandidatesFromSources(demoSources)
  const result = await generateStyleFromCandidates(candidates, projectRoot)
  await writeDemoResult(result, outputRoot)
  return result
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  runDemo()
    .then((result) => {
      process.stdout.write(`${[
        `tokens: ${result.tokens.length}`,
        `classSet: ${result.classSet.length}`,
        `css: ${path.relative(process.cwd(), path.join(process.cwd(), 'dist', 'style.css'))}`,
      ].join('\n')}\n`)
    })
    .catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
      process.exitCode = 1
    })
}
