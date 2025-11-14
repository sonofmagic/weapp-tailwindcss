/* empty */
// Micro benchmark for JS handlers: Babel vs SWC vs OXC POCs.
// Usage:
//   pnpm tsx packages/weapp-tailwindcss/scripts/js-bench.ts
//   pnpm tsx packages/weapp-tailwindcss/scripts/js-bench.ts --engines=babel,swc,oxc --iter=5 --warmup=1
//   pnpm tsx packages/weapp-tailwindcss/scripts/js-bench.ts --glob="packages/weapp-tailwindcss/test/fixtures/jsx/**/*.js"
//
// Notes:
// - SWC requires @swc/core.
// - OXC requires @oxc-parser/node or @oxc-parser/wasm (one is enough).
// - We focus on transform hot-path. For fairness and determinism, we run with:
//   { alwaysEscape: true, needEscaped: true, generateMap: false }
//   so the handlers do roughly the same amount of work regardless of classNameSet.
import type { IJsHandlerOptions, JsHandlerResult } from '../src/types'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { MappingChars2String } from '@weapp-core/escape'
import fg from 'fast-glob'
import fs from 'fs-extra'
import pc from 'picocolors'
import { getDefaultOptions } from '../src/defaults'

// Resolve repo root independenty of CWD.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../../..')

type EngineId = 'babel' | 'swc' | 'oxc'

interface RunOptions {
  engines: EngineId[]
  glob: string | string[]
  iter: number
  warmup: number
}

function parseArgs(): RunOptions {
  const args = process.argv.slice(2)
  const aAfter = (a: string, p: string) => a.slice(p.length)
  const get = (k: string, d?: string) => {
    const p = `--${k}=`
    const v = args.find(a => a.startsWith(p))
    return v ? aAfter(v, p) : d
  }
  const enginesStr = get('engines', 'babel,swc,oxc')!
  const engines = enginesStr.split(',').map(s => s.trim()).filter(Boolean) as EngineId[]
  const glob = get('glob', 'packages/weapp-tailwindcss/test/fixtures/**/*.{js,jsx,ts,tsx,wxs}')!
  const iter = Number(get('iter', '5'))
  const warmup = Number(get('warmup', '1'))
  return { engines, glob, iter, warmup }
}

function now() {
  return performance.now()
}

function toFixed2(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : String(n)
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) {
    return 0
  }
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.min(Math.max(idx, 0), sorted.length - 1)]
}

async function loadFiles(globPattern: string | string[]) {
  const absCwd = repoRoot
  const entries = await fg(globPattern, {
    cwd: absCwd,
    absolute: true,
    dot: false,
    onlyFiles: true,
    suppressErrors: true,
  })
  const items: { id: string, code: string }[] = []
  for (const id of entries) {
    const code = await fs.readFile(id, 'utf8')
    items.push({ id, code })
  }
  return items
}

function makeBaseOptions(): IJsHandlerOptions {
  const defaults = getDefaultOptions()
  return {
    // Ensure the three engines do comparable work
    alwaysEscape: true,
    needEscaped: true,
    generateMap: false,
    unescapeUnicode: true,
    escapeMap: MappingChars2String,
    ignoreTaggedTemplateExpressionIdentifiers: defaults.ignoreTaggedTemplateExpressionIdentifiers,
    // Keep eval/require/module specifier replacements in POC path disabled by default here.
    // They can be added per-case using extra options if desired.
    babelParserOptions: defaults.babelParserOptions,
  }
}

function useBabel() {
  // Import the Babel implementation
  // eslint-disable-next-line ts/no-require-imports
  const { jsHandler } = require('../src/js/babel') as typeof import('../src/js/babel')
  return jsHandler
}

function useSwc() {
  // eslint-disable-next-line ts/no-require-imports
  const { swcJsHandler } = require('../src/experimental/swc') as typeof import('../src/experimental/swc')
  return swcJsHandler
}

function useOxc() {
  // eslint-disable-next-line ts/no-require-imports
  const { oxcJsHandler } = require('../src/experimental/oxc') as typeof import('../src/experimental/oxc')
  return oxcJsHandler
}

async function runEngine(
  id: EngineId,
  files: { id: string, code: string }[],
  options: IJsHandlerOptions,
  iter: number,
  warmup: number,
) {
  let handler: (code: string, opts: IJsHandlerOptions) => JsHandlerResult
  if (id === 'babel') {
    handler = useBabel()
  }
  else if (id === 'swc') {
    handler = useSwc()
  }
  else if (id === 'oxc') {
    handler = useOxc()
  }
  else {
    throw new Error(`unknown engine: ${id}`)
  }

  // Warmup
  for (let w = 0; w < warmup; w++) {
    for (const f of files) {
      try {
        handler(f.code, options)
      }
      catch {
        // ignore
      }
    }
  }

  // Measure
  const perRunDurations: number[] = []
  const t0 = now()
  for (let r = 0; r < iter; r++) {
    const rStart = now()
    for (const f of files) {
      const res = handler(f.code, options)
      if (!res || typeof res.code !== 'string') {
        throw new Error(`${id} returned invalid result for ${f.id}`)
      }
    }
    perRunDurations.push(now() - rStart)
  }
  const total = now() - t0

  perRunDurations.sort((a, b) => a - b)
  const med = percentile(perRunDurations, 50)
  const p95 = percentile(perRunDurations, 95)
  const filesPerSec = (files.length * iter) / (total / 1000)

  return { total, med, p95, filesPerSec, runs: iter, files: files.length }
}

async function main() {
  const args = parseArgs()
  const files = await loadFiles(args.glob)
  if (files.length === 0) {
    console.log(pc.yellow(`No files matched: ${args.glob}`))
    process.exitCode = 1
    return
  }
  const baseOpts = makeBaseOptions()

  console.log(pc.cyan(`JS Handler Benchmark`))
  console.log(`  files: ${files.length}`)
  console.log(`  engines: ${args.engines.join(', ')}`)
  console.log(`  iter: ${args.iter}, warmup: ${args.warmup}`)
  console.log('')

  for (const id of args.engines) {
    try {
      const result = await runEngine(id, files, baseOpts, args.iter, args.warmup)
      const { total, med, p95, filesPerSec, runs, files: fcount } = result
      console.log(pc.bold(`${id}`))
      console.log(`  total: ${toFixed2(total)} ms  (${runs} runs × ${fcount} files)`)
      console.log(`  median per-run: ${toFixed2(med)} ms`)
      console.log(`  p95 per-run:    ${toFixed2(p95)} ms`)
      console.log(`  throughput:     ${toFixed2(filesPerSec)} files/s`)
      console.log('')
    }
    catch (err: any) {
      console.log(pc.red(`${id} failed: ${err?.message ?? err}`))
      console.log('')
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
