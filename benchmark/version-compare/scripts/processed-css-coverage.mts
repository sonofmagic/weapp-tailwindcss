import process from 'node:process'
import { pathToFileURL } from 'node:url'

interface BenchmarkStats {
  count: number
  max: number
  mean: number
  median: number
  min: number
  p95: number
  stddev: number
}

interface RemoveCssCoveredByRootStyleBundleSources {
  (bundle: Record<string, unknown>, file: string, css: string): string
}

function summarize(values: number[]): BenchmarkStats {
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const medianIndex = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[medianIndex - 1]! + sorted[medianIndex]!) / 2
    : sorted[medianIndex]!
  const p95Index = Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length
  return {
    count: values.length,
    max: sorted.at(-1)!,
    mean,
    median,
    min: sorted[0]!,
    p95: sorted[p95Index]!,
    stddev: Math.sqrt(variance),
  }
}

function createRule(index: number, scoped = false) {
  const scope = scoped ? '[data-v-benchmark]' : ''
  return `.bench-${index}${scope}{color:rgb(${index % 255},${(index * 3) % 255},${(index * 7) % 255});padding:${index % 17}px}`
}

function createFixture() {
  const rootRules = Array.from({ length: 5000 }, (_, index) => createRule(index))
  const repeatedRules = Array.from({ length: 4000 }, (_, index) => createRule(index))
  const scopedRules = Array.from({ length: 1000 }, (_, index) => createRule(5000 + index, true))
  const rootCss = [
    '@property --tw-bench { syntax: "*"; inherits: false; }',
    ...rootRules,
  ].join('\n')
  const targetCss = [
    '/* tailwindcss v4 benchmark */',
    '@property --tw-bench { syntax: "*"; inherits: false; }',
    ...repeatedRules,
    ...scopedRules,
  ].join('\n')
  const bundle = {
    'app.wxss': {
      fileName: 'app.wxss',
      name: 'app.wxss',
      source: rootCss,
      type: 'asset',
    },
    'pages/index/index.wxss': {
      fileName: 'pages/index/index.wxss',
      name: 'pages/index/index.wxss',
      source: targetCss,
      type: 'asset',
    },
  }
  return { bundle, targetCss }
}

function runSample(removeCssCoveredByRootStyleBundleSources: RemoveCssCoveredByRootStyleBundleSources) {
  const { bundle, targetCss } = createFixture()
  const startedAt = performance.now()
  const result = removeCssCoveredByRootStyleBundleSources(bundle, 'pages/index/index.wxss', targetCss)
  const durationMs = performance.now() - startedAt
  if (result.includes('.bench-1{') || !result.includes('.bench-5000[data-v-benchmark]')) {
    throw new Error('processed css coverage benchmark produced an invalid result')
  }
  return durationMs
}

async function main() {
  const sourceFile = process.argv[2]
  if (!sourceFile) {
    throw new Error('processed css assets module path is required')
  }
  const { removeCssCoveredByRootStyleBundleSources } = await import(pathToFileURL(sourceFile).href)
  runSample(removeCssCoveredByRootStyleBundleSources)
  const samples: number[] = []
  for (let index = 0; index < 3; index++) {
    samples.push(runSample(removeCssCoveredByRootStyleBundleSources))
  }
  process.stdout.write(`${JSON.stringify({
    samples,
    summary: summarize(samples),
  })}\n`)
}

void main()
