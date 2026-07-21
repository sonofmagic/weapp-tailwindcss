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

interface InjectViteProcessedCssIntoMainCssAssets {
  (bundle: Record<string, unknown>, options: Record<string, unknown>): number
}

const BENCHMARK_SAMPLE_COUNT = 7

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

function asset(fileName: string, source: string) {
  return {
    fileName,
    names: [],
    originalFileNames: [],
    source,
    type: 'asset',
  }
}

function createRule(index: number) {
  return `.bench-${index}{color:rgb(${index % 255},${(index * 3) % 255},${(index * 7) % 255});padding:${index % 17}px}`
}

function createFixture() {
  const preflight = 'view,text,::after,::before{box-sizing:border-box;border:0 solid;--tw-content:""}'
  const theme = ':host,page,.tw-root,wx-root-portal-content{--tw-border-style:solid;--tw-ring-color:#0000}'
  const rootCss = [
    preflight,
    theme,
    ...Array.from({ length: 5000 }, (_, index) => createRule(index)),
  ].join('\n')
  const generatedCss = [
    preflight,
    theme,
    ...Array.from({ length: 5500 }, (_, index) => createRule(index)),
  ].join('\n')
  const bundle: Record<string, unknown> = {
    'app.wxss': asset('app.wxss', rootCss),
    'src/generated.css': asset('src/generated.css', generatedCss),
  }
  for (let index = 0; index < 20; index++) {
    bundle[`pages/page-${index}.wxss`] = asset(`pages/page-${index}.wxss`, `.page-${index}{display:block}`)
  }
  const records = new Map([
    ['src/generated.css', {
      css: generatedCss,
      injectIntoMain: true,
      outputFile: 'app.wxss',
    }],
  ])
  return { bundle, records }
}

function runSample(injectViteProcessedCssIntoMainCssAssets: InjectViteProcessedCssIntoMainCssAssets) {
  const { bundle, records } = createFixture()
  const startedAt = performance.now()
  injectViteProcessedCssIntoMainCssAssets(bundle, {
    opts: {
      appType: 'taro',
      cssMatcher: (file: string) => /\.(?:css|wxss)$/.test(file),
      mainCssChunkMatcher: (file: string) => file === 'app.wxss',
    },
    getViteProcessedCssAssetResults: () => records.entries(),
    shouldRemoveInjectedSourceAsset: () => true,
  })
  const durationMs = performance.now() - startedAt
  const appCss = String((bundle['app.wxss'] as { source: unknown }).source)
  if (!appCss.includes('.bench-5499{') || appCss.match(/\.bench-1\{/g)?.length !== 1) {
    throw new Error('processed css injection benchmark produced an invalid result')
  }
  return durationMs
}

async function main() {
  const sourceFile = process.argv[2]
  if (!sourceFile) {
    throw new Error('processed css assets module path is required')
  }
  const { injectViteProcessedCssIntoMainCssAssets } = await import(pathToFileURL(sourceFile).href)
  runSample(injectViteProcessedCssIntoMainCssAssets)
  const samples: number[] = []
  for (let index = 0; index < BENCHMARK_SAMPLE_COUNT; index++) {
    samples.push(runSample(injectViteProcessedCssIntoMainCssAssets))
  }
  process.stdout.write(`${JSON.stringify({
    samples,
    summary: summarize(samples),
  })}\n`)
}

void main()
