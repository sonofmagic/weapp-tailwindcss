import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { renderMarkdown, writeMarkdownReport } from '../src/report'
import type { BenchmarkReport } from '../src/types'

function createFixtureReport(): BenchmarkReport {
  return {
    schemaVersion: 1,
    generatedAt: '2026-07-06T00:00:00.000Z',
    environment: {
      node: 'v24.0.0',
      pnpm: '11.9.0',
      platform: 'darwin',
      arch: 'arm64',
      osRelease: '25.0.0',
      cpus: ['Apple M-series'],
      packageVersions: {
        '@tailwindcss/postcss': '4.0.0',
        '@tailwindcss/vite': '4.0.0',
        tailwindcss: '4.0.0',
        vite: '7.0.0',
        'weapp-tailwindcss': '5.0.0',
      },
    },
    parameters: {
      runs: 1,
      warmups: 0,
      classCount: 12,
      sourceFiles: 2,
      largeClassCount: 1200,
      largeSourceFiles: 12,
      includeLarge: true,
      includeHmr: true,
    },
    scenarios: [
      {
        id: 'default',
        name: '默认规模',
        classCount: 12,
        sourceFiles: 2,
        candidateCount: 12,
        appendedCandidateCount: 4,
        hmrCandidateCount: 32,
      },
    ],
    results: [
      {
        id: 'weapp-generator-scan-weapp',
        name: 'weapp-tailwindcss generator target=weapp scanSources=true',
        mode: 'generator',
        plugin: 'weapp-tailwindcss/generator',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [10],
        stats: {
          mean: 10,
          median: 10,
          min: 10,
          max: 10,
          p75: 10,
          p95: 10,
        },
        outputCssBytes: 1024,
        classSetSize: 12,
        selectorCount: 12,
      },
      {
        id: 'official-postcss-core',
        name: '@tailwindcss/postcss direct postcss process',
        mode: 'generator',
        plugin: '@tailwindcss/postcss',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [12],
        stats: {
          mean: 12,
          median: 12,
          min: 12,
          max: 12,
          p75: 12,
          p95: 12,
        },
        outputCssBytes: 2048,
        selectorCount: 12,
      },
      {
        id: 'vite-official-postcss',
        name: 'Vite build + @tailwindcss/postcss',
        mode: 'vite-build',
        plugin: '@tailwindcss/postcss',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [35],
        stats: {
          mean: 35,
          median: 35,
          min: 35,
          max: 35,
          p75: 35,
          p95: 35,
        },
        outputCssBytes: 4096,
        selectorCount: 12,
      },
      {
        id: 'vite-official-vite',
        name: 'Vite build + @tailwindcss/vite',
        mode: 'vite-build',
        plugin: '@tailwindcss/vite',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [30],
        stats: {
          mean: 30,
          median: 30,
          min: 30,
          max: 30,
          p75: 30,
          p95: 30,
        },
        outputCssBytes: 4096,
        selectorCount: 12,
      },
      {
        id: 'vite-weapp-target-web',
        name: "Vite build + weapp-tailwindcss/vite generator.target='web'",
        mode: 'vite-build',
        plugin: 'weapp-tailwindcss/vite',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [40],
        stats: {
          mean: 40,
          median: 40,
          min: 40,
          max: 40,
          p75: 40,
          p95: 40,
        },
        outputCssBytes: 4096,
        selectorCount: 12,
      },
      {
        id: 'vite-weapp-target-web-compact',
        name: "Vite build + weapp-tailwindcss/vite generator.target='web' webCompat=true",
        mode: 'vite-build',
        plugin: 'weapp-tailwindcss/vite',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [44],
        stats: {
          mean: 44,
          median: 44,
          min: 44,
          max: 44,
          p75: 44,
          p95: 44,
        },
        outputCssBytes: 4608,
        selectorCount: 14,
        memory: {
          rssBeforeBytes: 1024,
          rssAfterBytes: 2048,
          rssPeakBytes: 4096,
          rssDeltaBytes: 1024,
          heapBeforeBytes: 512,
          heapAfterBytes: 1024,
          heapPeakBytes: 2048,
          heapDeltaBytes: 512,
        },
      },
      {
        id: 'hmr-official-postcss',
        name: 'Vite dev HMR + @tailwindcss/postcss',
        mode: 'vite-hmr',
        plugin: '@tailwindcss/postcss',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [9],
        stats: {
          mean: 9,
          median: 9,
          min: 9,
          max: 9,
          p75: 9,
          p95: 9,
        },
        outputCssBytes: 2048,
        selectorCount: 12,
      },
      {
        id: 'hmr-official-vite',
        name: 'Vite dev HMR + @tailwindcss/vite',
        mode: 'vite-hmr',
        plugin: '@tailwindcss/vite',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [8],
        stats: {
          mean: 8,
          median: 8,
          min: 8,
          max: 8,
          p75: 8,
          p95: 8,
        },
        outputCssBytes: 2048,
        selectorCount: 12,
      },
      {
        id: 'hmr-weapp-target-web',
        name: "Vite dev HMR + weapp-tailwindcss/vite generator.target='web'",
        mode: 'vite-hmr',
        plugin: 'weapp-tailwindcss/vite',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [18],
        stats: {
          mean: 18,
          median: 18,
          min: 18,
          max: 18,
          p75: 18,
          p95: 18,
        },
        outputCssBytes: 2048,
        selectorCount: 12,
      },
      {
        id: 'hmr-weapp-target-web-compact',
        name: "Vite dev HMR + weapp-tailwindcss/vite generator.target='web' webCompat=true",
        mode: 'vite-hmr',
        plugin: 'weapp-tailwindcss/vite',
        scenarioId: 'default',
        scenarioName: '默认规模',
        warmupMs: [],
        runsMs: [20],
        stats: {
          mean: 20,
          median: 20,
          min: 20,
          max: 20,
          p75: 20,
          p95: 20,
        },
        outputCssBytes: 2304,
        selectorCount: 14,
      },
    ],
  }
}

describe('report', () => {
  it('renders official plugins and weapp modes', () => {
    const markdown = renderMarkdown(createFixtureReport())
    expect(markdown).toContain('@tailwindcss/postcss')
    expect(markdown).toContain('@tailwindcss/vite')
    expect(markdown).toContain('weapp-tailwindcss 生成器 target=weapp')
    expect(markdown).toContain("generator.target='web'")
    expect(markdown).toContain('web-compact')
    expect(markdown).toContain('## Web target 与官方插件对比')
    expect(markdown).toContain('相对 @tailwindcss/vite')
    expect(markdown).toContain('Vite dev/HMR')
    expect(markdown).toContain('## 详细解读')
    expect(markdown).toContain('### 内存占用')
  })

  it('writes markdown from a custom input path', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-report-test-'))
    const input = path.join(root, 'input.json')
    const output = path.join(root, 'nested', 'report.md')
    await writeFile(input, JSON.stringify(createFixtureReport()), 'utf8')
    await writeMarkdownReport(input, output)
    const markdown = await readFile(output, 'utf8')
    expect(markdown).toContain('Tailwind CSS v4 插件性能 Benchmark')
    expect(markdown).toContain('## 结果解读')
  })
})
