import { describe, expect, it } from 'vitest'

describe('benchmark ci report', () => {
  it('keeps version compare benchmark covering every demo package', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const { benchmarkProjects } = await import('../../../../benchmark/version-compare/scripts/projects.mjs')

    const repoRoot = path.resolve(__dirname, '../../../..')
    const collectPackageDirs = (dir: string): string[] => {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name)
        if (!entry.isDirectory()) {
          return []
        }
        if (entry.name.startsWith('.tmp-')) {
          return []
        }
        const packageJson = path.join(full, 'package.json')
        if (fs.existsSync(packageJson)) {
          return [path.relative(repoRoot, full).replaceAll(path.sep, '/')]
        }
        return collectPackageDirs(full)
      })
    }

    const demoProjects = collectPackageDirs(path.join(repoRoot, 'demo')).sort()
      .filter(project => !project.startsWith('demo/issue-'))
      .filter(project => !project.startsWith('demo/subpackage-'))
      .filter(project => !project.startsWith('demo/style-injector-'))
      .filter(project => project !== 'demo/web/nuxt-vite-tailwindcss-v4')
      .filter(project => !project.startsWith('demo/web/') || project.includes('-vite-'))
    const benchmarkProjectDirs = Array.from(new Set(benchmarkProjects.map(project => project.project))).sort()

    expect(benchmarkProjectDirs).toEqual(demoProjects)
    expect(benchmarkProjects.map(project => project.key)).toEqual(expect.arrayContaining([
      'demo-web-react-vite-tailwindcss-v4__web',
      'demo-web-vue-vite-tailwindcss-v4__web',
      'demo-uni-app-vite-tailwindcss-v4__mp-weixin',
      'demo-uni-app-vite-tailwindcss-v4__h5',
      'demo-mpx-tailwindcss-v4__mp-weixin',
    ]))
    const uniMpWeixin = benchmarkProjects.find(project => project.key === 'demo-uni-app-vite-tailwindcss-v4__mp-weixin')
    expect(uniMpWeixin?.buildEnv).toMatchObject({ UNI_BUILD_STRICT: '1' })
    expect(uniMpWeixin?.devScript).toBe('dev:mp-weixin')
    expect(uniMpWeixin?.hmrMode).toBe('watch')
    const mpxMpWeixin = benchmarkProjects.find(project => project.key === 'demo-mpx-tailwindcss-v4__mp-weixin')
    expect(mpxMpWeixin?.devScript).toBe('dev:e2e-watch')
    expect(mpxMpWeixin?.hmrMode).toBe('watch')
    expect(mpxMpWeixin?.hmrPluginStatistic).toBe('median')
    expect(mpxMpWeixin?.hmrEndToEndGuard).toBe(false)
    expect(mpxMpWeixin?.hmrGuardNote).toContain('processAssets median remains guarded')
    expect(benchmarkProjects.filter(project => project.key.includes('taro') && project.target === 'mp-weixin').every(project => project.hmrMode === 'watch')).toBe(true)
    const realDevServerTargets = benchmarkProjects.filter(project => (project.target === 'h5' || project.target === 'web') && !project.key.includes('hbuilderx'))
    expect(realDevServerTargets.every(project => project.hmrMode === 'watch')).toBe(true)
    expect(realDevServerTargets.every(project => project.hmrDriver === 'dev-server')).toBe(true)
    expect(benchmarkProjects.filter(project => project.target === 'h5' && project.key.includes('hbuilderx')).every(project => project.hmrMode === 'unsupported')).toBe(true)
  })

  it('keeps benchmark working copies free from stale build outputs', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const source = fs.readFileSync(path.resolve(__dirname, '../../../../benchmark/version-compare/scripts/run-ci.mjs'), 'utf8')
    const matrixSource = fs.readFileSync(path.resolve(__dirname, '../../../../benchmark/version-compare/scripts/run-matrix.mjs'), 'utf8')

    expect(source).toContain("part === 'dist'")
    expect(source).toContain('runSourceCandidateHotUpdateBenchmark')
    expect(source).toContain('core-source-candidate-hot-update')
    expect(source).toContain('runProcessedCssCoverageBenchmark')
    expect(source).toContain('core-vite-processed-css-coverage')
    expect(source).toContain('runProcessedCssInjectionBenchmark')
    expect(source).toContain('core-vite-processed-css-injection')
    expect(source.match(/hmrPluginStatistic: 'median'/g)).toHaveLength(3)
    expect(source).toContain("parseNumber('--poll-interval', 30)")
    expect(matrixSource).toContain("parseNumber('--poll-interval', 30)")
    for (const benchmarkScript of [
      'source-candidate-hot-update.mts',
      'processed-css-coverage.mts',
      'processed-css-injection.mts',
    ]) {
      const benchmarkSource = fs.readFileSync(path.resolve(__dirname, '../../../../benchmark/version-compare/scripts', benchmarkScript), 'utf8')
      expect(benchmarkSource).toContain('const BENCHMARK_SAMPLE_COUNT = 7')
    }

    const projectLoopIndex = matrixSource.indexOf('for (const projectMeta of selectedProjects)')
    const versionLoopIndex = matrixSource.indexOf('for (const versionMeta of versions)', projectLoopIndex)
    expect(projectLoopIndex).toBeGreaterThan(-1)
    expect(versionLoopIndex).toBeGreaterThan(projectLoopIndex)
  })

  it('extracts plugin processing time from structured Vite and Webpack timing logs', async () => {
    const { resolvePluginProcessMs, resolvePluginTimingSample } = await import('../../../../benchmark/version-compare/scripts/timing.mjs')
    const lines = [
      '[weapp-tailwindcss:hmr] {"bundler":"vite","phase":"generateBundle","durationMs":82}',
      '[weapp-tailwindcss:hmr] {"bundler":"vite","phase":"total","durationMs":91,"metric":"total"}',
      '[weapp-tailwindcss:hmr] {"bundler":"webpack","phase":"processAssets","durationMs":126}',
      'unrelated output',
    ]

    expect(resolvePluginProcessMs(lines.slice(0, 2))).toBe(91)
    expect(resolvePluginTimingSample(lines.slice(0, 2))).toMatchObject({
      bundler: 'vite',
      durationMs: 91,
      details: {
        phase: 'generateBundle',
        durationMs: 82,
      },
    })
    expect(resolvePluginProcessMs(lines.slice(2))).toBe(126)
    expect(resolvePluginProcessMs(['unrelated output'])).toBeUndefined()
  })

  it('keeps round timing logs after the bounded diagnostic buffer rolls over', async () => {
    const { createWatchLogBuffer } = await import('../../../../benchmark/version-compare/scripts/watch-log-buffer.mjs')
    const buffer = createWatchLogBuffer(3)
    buffer.collect(Buffer.from('startup-1\nstartup-2\nstartup-3\n'))
    const round = buffer.beginRound()

    buffer.collect(Buffer.from('verbose-1\nverbose-2\nverbose-3\n'))
    buffer.collect(Buffer.from('[weapp-tailwindcss:hmr] {"bundler":"webpack","phase":"processAssets","durationMs":126}\n'))

    expect(buffer.lines).toHaveLength(3)
    expect(buffer.lines).not.toContain('startup-3')
    expect(round.lines).toEqual([
      'verbose-1',
      'verbose-2',
      'verbose-3',
      '[weapp-tailwindcss:hmr] {"bundler":"webpack","phase":"processAssets","durationMs":126}',
    ])
    round.close()
    buffer.collect(Buffer.from('after-round\n'))
    expect(round.lines).not.toContain('after-round')
  })

  it('guards cold build median, HMR timing and sustained memory regressions', async () => {
    const { buildSummary, evaluatePerformanceGuard } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-14T00:00:00.000Z',
      options: {
        buildRuns: 3,
        hmrRuns: 5,
        timeoutMs: 180000,
      },
      rows: [
        {
          version: baselineLabel,
          key: 'demo-taro-vite-react-tailwindcss-v4__mp-weixin',
          hmrMode: 'watch',
          summary: {
            build: { median: 1000 },
            hmr: { p95: 500 },
            buildPlugin: { median: 200 },
            hmrPlugin: { p95: 100 },
            buildPeakRssMb: { median: 1000 },
            buildSteadyRssMb: { median: 800 },
            hmrPeakRssMb: { median: 1200 },
            hmrSteadyRssMb: { median: 900 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-taro-vite-react-tailwindcss-v4__mp-weixin',
          hmrMode: 'watch',
          summary: {
            build: { median: 1060 },
            hmr: { p95: 525 },
            buildPlugin: { median: 211 },
            hmrPlugin: { p95: 105 },
            buildPeakRssMb: { median: 1050 },
            buildSteadyRssMb: { median: 865 },
            hmrPeakRssMb: { median: 1265 },
            hmrSteadyRssMb: { median: 965 },
          },
        },
      ],
    }, baselineLabel, currentLabel)

    const result = evaluatePerformanceGuard(summary)

    expect(result.violations.map(item => item.metric)).toEqual([
      'buildMedian',
      'buildPluginMedian',
      'buildSteadyRssMb',
      'hmrPeakRssMb',
      'hmrSteadyRssMb',
    ])
    expect(result.thresholds.regressionPercent).toBe(5)
    expect(result.thresholds.minimumTimingRegressionMs).toBe(10)
    expect(result.thresholds.minimumMemoryRegressionMb).toBe(64)
    expect(result.thresholds.minimumTailRegressionSamples).toBe(2)
    expect(result.passed).toBe(false)
  })

  it('requires sustained median or two tail samples before failing small-sample HMR timing', async () => {
    const { buildSummary, evaluatePerformanceGuard } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-20T00:00:00.000Z',
      options: { buildRuns: 1, hmrRuns: 6, timeoutMs: 180000 },
      rows: [
        {
          version: baselineLabel,
          key: 'single-tail-outlier',
          hmrMode: 'watch',
          hmrMs: [90, 92, 94, 96, 98, 100],
          hmrPluginMs: [40, 42, 44, 46, 48, 50],
          summary: {
            hmr: { median: 95, p95: 100 },
            hmrPlugin: { median: 45, p95: 50 },
          },
        },
        {
          version: currentLabel,
          key: 'single-tail-outlier',
          hmrMode: 'watch',
          hmrMs: [91, 93, 95, 97, 99, 300],
          hmrPluginMs: [41, 43, 45, 47, 49, 200],
          summary: {
            hmr: { median: 96, p95: 300 },
            hmrPlugin: { median: 46, p95: 200 },
          },
        },
        {
          version: baselineLabel,
          key: 'framework-only-median-regression',
          hmrMode: 'watch',
          hmrMs: [90, 92, 94, 96, 98, 100],
          hmrPluginMs: [40, 42, 44, 46, 48, 50],
          summary: {
            hmr: { median: 95, p95: 100 },
            hmrPlugin: { median: 45, p95: 50 },
          },
        },
        {
          version: currentLabel,
          key: 'framework-only-median-regression',
          hmrMode: 'watch',
          hmrMs: [110, 112, 114, 116, 118, 120],
          hmrPluginMs: [41, 43, 45, 47, 49, 51],
          summary: {
            hmr: { median: 115, p95: 120 },
            hmrPlugin: { median: 46, p95: 51 },
          },
        },
        {
          version: baselineLabel,
          key: 'two-tail-regressions',
          hmrMode: 'watch',
          hmrMs: [90, 92, 94, 96, 98, 100],
          hmrPluginMs: [40, 42, 44, 46, 48, 50],
          summary: {
            hmr: { median: 95, p95: 100 },
            hmrPlugin: { median: 45, p95: 50 },
          },
        },
        {
          version: currentLabel,
          key: 'two-tail-regressions',
          hmrMode: 'watch',
          hmrMs: [91, 93, 95, 97, 120, 130],
          hmrPluginMs: [41, 43, 45, 47, 70, 80],
          summary: {
            hmr: { median: 96, p95: 130 },
            hmrPlugin: { median: 46, p95: 80 },
          },
        },
        {
          version: baselineLabel,
          key: 'median-regression',
          hmrMode: 'watch',
          hmrMs: [90, 92, 94, 96, 98, 100],
          hmrPluginMs: [40, 42, 44, 46, 48, 50],
          summary: {
            hmr: { median: 95, p95: 100 },
            hmrPlugin: { median: 45, p95: 50 },
          },
        },
        {
          version: currentLabel,
          key: 'median-regression',
          hmrMode: 'watch',
          hmrMs: [110, 112, 114, 116, 118, 120],
          hmrPluginMs: [55, 57, 59, 61, 63, 65],
          summary: {
            hmr: { median: 115, p95: 120 },
            hmrPlugin: { median: 60, p95: 65 },
          },
        },
        {
          version: baselineLabel,
          key: 'even-median-half-regression',
          hmrMode: 'watch',
          hmrPluginStatistic: 'median',
          hmrPluginMs: [40, 42, 44, 46, 48, 50],
          summary: {
            hmrPlugin: { median: 45, p95: 50 },
          },
        },
        {
          version: currentLabel,
          key: 'even-median-half-regression',
          hmrMode: 'watch',
          hmrPluginStatistic: 'median',
          hmrPluginMs: [46, 47, 48, 63, 64, 65],
          summary: {
            hmrPlugin: { median: 55.5, p95: 65 },
          },
        },
      ],
    }, baselineLabel, currentLabel)

    const result = evaluatePerformanceGuard(summary)

    expect(result.violations.filter(item => item.key === 'single-tail-outlier' && item.metric !== 'hmrMemorySamples')).toEqual([])
    expect(result.violations.filter(item => item.key === 'framework-only-median-regression' && item.metric !== 'hmrMemorySamples')).toEqual([])
    expect(result.violations).toContainEqual(expect.objectContaining({
      key: 'two-tail-regressions',
      metric: 'hmrP95',
      regressionSamples: 2,
    }))
    expect(result.violations).toContainEqual(expect.objectContaining({
      key: 'two-tail-regressions',
      metric: 'hmrPluginP95',
      regressionSamples: 2,
    }))
    expect(result.violations).toContainEqual(expect.objectContaining({
      key: 'median-regression',
      metric: 'hmrMedian',
    }))
    expect(result.violations).toContainEqual(expect.objectContaining({
      key: 'median-regression',
      metric: 'hmrPluginMedian',
    }))
    expect(result.violations.filter(item => item.key === 'even-median-half-regression')).toEqual([])
  })

  it('keeps isolated RSS peaks and sub-64MB memory drift informational', async () => {
    const { buildSummary, evaluatePerformanceGuard } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-20T00:00:00.000Z',
      options: { buildRuns: 3, hmrRuns: 6, timeoutMs: 180000 },
      rows: [
        {
          version: baselineLabel,
          key: 'rss-noise',
          hmrMode: 'watch',
          summary: {
            build: { median: 500 },
            buildPeakRssMb: { median: 330 },
            buildSteadyRssMb: { median: 330 },
            hmr: { median: 100, p95: 110 },
            hmrPeakRssMb: { median: 2200 },
            hmrSteadyRssMb: { median: 2100 },
          },
        },
        {
          version: currentLabel,
          key: 'rss-noise',
          hmrMode: 'watch',
          summary: {
            build: { median: 500 },
            buildPeakRssMb: { median: 375 },
            buildSteadyRssMb: { median: 375 },
            hmr: { median: 100, p95: 110 },
            hmrPeakRssMb: { median: 2450 },
            hmrSteadyRssMb: { median: 2140 },
          },
        },
      ],
    }, baselineLabel, currentLabel)

    expect(evaluatePerformanceGuard(summary).passed).toBe(true)
  })

  it('ignores sub-10ms timing drift while retaining the percentage guard for larger regressions', async () => {
    const { buildSummary, evaluatePerformanceGuard } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-20T00:00:00.000Z',
      options: { buildRuns: 1, hmrRuns: 1, timeoutMs: 180000 },
      rows: [
        {
          version: baselineLabel,
          key: 'micro-noise',
          hmrMode: 'watch',
          summary: { hmrPlugin: { p95: 50 } },
        },
        {
          version: currentLabel,
          key: 'micro-noise',
          hmrMode: 'watch',
          summary: { hmrPlugin: { p95: 56 } },
        },
        {
          version: baselineLabel,
          key: 'real-regression',
          hmrMode: 'watch',
          summary: { hmrPlugin: { p95: 100 } },
        },
        {
          version: currentLabel,
          key: 'real-regression',
          hmrMode: 'watch',
          summary: { hmrPlugin: { p95: 111 } },
        },
      ],
    }, baselineLabel, currentLabel)

    const result = evaluatePerformanceGuard(summary)

    expect(result.violations).not.toContainEqual(expect.objectContaining({ key: 'micro-noise' }))
    expect(result.violations).toContainEqual(expect.objectContaining({
      key: 'real-regression',
      metric: 'hmrPluginP95',
      absoluteDelta: 11,
    }))
  })

  it('uses the median for isolated core micro benchmarks while keeping watch plugins on P95', async () => {
    const { buildSummary, evaluatePerformanceGuard, toMarkdown } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-20T00:00:00.000Z',
      options: { buildRuns: 1, hmrRuns: 3, timeoutMs: 180000 },
      rows: [
        {
          version: baselineLabel,
          key: 'core-vite-processed-css-coverage',
          hmrMode: 'watch',
          hmrPluginStatistic: 'median',
          summary: { hmrPlugin: { median: 124, p95: 156 } },
        },
        {
          version: currentLabel,
          key: 'core-vite-processed-css-coverage',
          hmrMode: 'watch',
          hmrPluginStatistic: 'median',
          summary: { hmrPlugin: { median: 118, p95: 171 } },
        },
        {
          version: baselineLabel,
          key: 'demo-watch',
          hmrMode: 'watch',
          summary: { hmrPlugin: { median: 80, p95: 100 } },
        },
        {
          version: currentLabel,
          key: 'demo-watch',
          hmrMode: 'watch',
          summary: { hmrPlugin: { median: 80, p95: 111 } },
        },
      ],
    }, baselineLabel, currentLabel)

    expect(summary.compares).toEqual(expect.arrayContaining([
      expect.objectContaining({
        key: 'core-vite-processed-css-coverage',
        baselineHmrPlugin: 124,
        currentHmrPlugin: 118,
        hmrPluginStatistic: 'median',
      }),
      expect.objectContaining({
        key: 'demo-watch',
        baselineHmrPlugin: 100,
        currentHmrPlugin: 111,
        hmrPluginStatistic: 'p95',
      }),
    ]))
    expect(evaluatePerformanceGuard(summary).violations).toContainEqual(expect.objectContaining({
      key: 'demo-watch',
      metric: 'hmrPluginP95',
    }))
    expect(toMarkdown(summary, 'main')).toContain('| core-vite-processed-css-coverage | - | - | - | median | 124.00 | 118.00 |')
  })

  it('uses the full build plugin median so one steady-sample outlier cannot dominate the guard', async () => {
    const { buildSummary, evaluatePerformanceGuard } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-15T00:00:00.000Z',
      options: { buildRuns: 3, hmrRuns: 1, timeoutMs: 180000, pollIntervalMs: 30 },
      rows: [
        {
          version: baselineLabel,
          key: 'demo-mpx-tailwindcss-v4__mp-weixin',
          buildPluginMs: [1424, 1471, 1417],
          summary: {
            buildPlugin: { median: 1424 },
            buildPluginSteady: { median: 1444 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-mpx-tailwindcss-v4__mp-weixin',
          buildPluginMs: [1412, 2029, 1477],
          summary: {
            buildPlugin: { median: 1477 },
            buildPluginSteady: { median: 1753 },
          },
        },
      ],
    }, baselineLabel, currentLabel)

    expect(summary.compares[0]).toMatchObject({
      baselineBuildPlugin: 1424,
      currentBuildPlugin: 1477,
    })
    expect(evaluatePerformanceGuard(summary).passed).toBe(true)
  })

  it('fails the performance guard when watch HMR plugin timing samples are incomplete', async () => {
    const { buildSummary, evaluatePerformanceGuard } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-14T00:00:00.000Z',
      options: { buildRuns: 1, hmrRuns: 3, timeoutMs: 180000 },
      rows: [
        {
          version: baselineLabel,
          key: 'demo-taro-vite-react-tailwindcss-v4__mp-weixin',
          hmrMode: 'watch',
          hmrMs: [100, 90, 80],
          hmrPluginMs: [50, 40, 30],
          summary: { hmr: { p95: 100 }, hmrPlugin: { p95: 50 } },
        },
        {
          version: currentLabel,
          key: 'demo-taro-vite-react-tailwindcss-v4__mp-weixin',
          hmrMode: 'watch',
          hmrMs: [100, 90, 80],
          hmrPluginMs: [50, 40],
          summary: { hmr: { p95: 100 }, hmrPlugin: { p95: 50 } },
        },
      ],
    }, baselineLabel, currentLabel)

    const result = evaluatePerformanceGuard(summary)

    expect(result.passed).toBe(false)
    expect(result.violations).toContainEqual(expect.objectContaining({
      metric: 'currentHmrPluginSamples',
      message: 'current HMR plugin timing samples 2/3',
    }))
    expect(result.violations).toContainEqual(expect.objectContaining({
      metric: 'hmrMemorySamples',
    }))
  })

  it('uses every post-ready HMR sample and keeps noisy framework end-to-end timing informational', async () => {
    const { buildSummary, evaluatePerformanceGuard, toMarkdown } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-14T00:00:00.000Z',
      options: { buildRuns: 1, hmrRuns: 4, timeoutMs: 180000 },
      rows: [
        {
          version: baselineLabel,
          key: 'demo-mpx-tailwindcss-v4__mp-weixin',
          hmrMode: 'watch',
          hmrEndToEndGuard: false,
          hmrGuardNote: 'framework output variance; plugin timing remains guarded',
          hmrMs: [100, 100, 100, 100],
          hmrPluginMs: [50, 50, 50, 50],
          summary: {
            hmr: { median: 100, p95: 100 },
            hmrSteady: { median: 100 },
            hmrPlugin: { median: 50, p95: 50 },
            hmrPluginSteady: { median: 50 },
            hmrPeakRssMb: { median: 800 },
            hmrSteadyRssMb: { median: 700 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-mpx-tailwindcss-v4__mp-weixin',
          hmrMode: 'watch',
          hmrEndToEndGuard: false,
          hmrGuardNote: 'framework output variance; plugin timing remains guarded',
          hmrMs: [110, 110, 500, 500],
          hmrPluginMs: [55, 55, 80, 80],
          summary: {
            hmr: { median: 305, p95: 500 },
            hmrSteady: { median: 500 },
            hmrPlugin: { median: 67.5, p95: 80 },
            hmrPluginSteady: { median: 80 },
            hmrPeakRssMb: { median: 800 },
            hmrSteadyRssMb: { median: 700 },
          },
        },
      ],
    }, baselineLabel, currentLabel)

    expect(summary.compares[0]).toMatchObject({
      baselineHmr: 100,
      currentHmr: 500,
      baselineHmrPlugin: 50,
      currentHmrPlugin: 80,
      hmrEndToEndGuard: false,
    })
    const result = evaluatePerformanceGuard(summary, { regressionPercent: 70 })
    expect(result.passed).toBe(true)
    expect(toMarkdown(summary, 'main')).toContain('HMR end-to-end informational: framework output variance; plugin timing remains guarded')
  })

  it('keeps dev server HMR measured through fixed-port development servers', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const source = fs.readFileSync(path.resolve(__dirname, '../../../../benchmark/version-compare/scripts/run-matrix.mjs'), 'utf8')

    expect(source).toContain('runDevServerHmrRounds')
    expect(source).toContain('Local|Loopback|Listening at')
    expect(source).toContain("['exec', 'vite', '--host', '127.0.0.1', '--port', String(port), '--strictPort']")
    expect(source).toContain("['exec', 'uni', '--host', '127.0.0.1', '--port', String(port), '--strictPort']")
    expect(source).toContain('resolveLoggedBaseUrls')
    expect(source).toContain('fetchProbeText')
    expect(source).toContain('await waitForPluginTimingSample(roundLogs.lines, 0, timeoutMs, pollIntervalMs)')
    expect(source).toContain('hmr rollback')
    expect(source).toContain("onlyItems.includes(item.key) || onlyItems.includes(item.project)")
    expect(source).toContain("className=(['\"])(.*?)\\1")
    expect(source).toContain('data-tw-bench')
    expect(source).toContain('outputProbeTemplates')
    expect(source).toContain('buildEnv.UNI_BUILD_STRICT=1')
    expect(source).toContain('build skipped by uni-build-guard')
    expect(source).toContain('createProcessMemorySampler')
  })

  it('summarizes process memory using peak and tail-window steady RSS', async () => {
    const { summarizeProcessMemory } = await import('../../../../benchmark/version-compare/scripts/process-memory.mjs')
    const summary = summarizeProcessMemory([
      { at: 1, rssMb: 100, processCount: 2 },
      { at: 2, rssMb: 120, processCount: 2 },
      { at: 3, rssMb: 140, processCount: 2 },
      { at: 4, rssMb: 130, processCount: 2 },
      { at: 5, rssMb: 132, processCount: 2 },
    ])

    expect(summary).toMatchObject({
      baselineRssMb: 100,
      peakRssMb: 140,
      steadyRssMb: 132,
      steadyGrowthPct: 32,
    })
  })

  it('applies the same 5% limit to CI peak and steady RSS reports', async () => {
    const { evaluateRelativeMemoryGuard } = await import('../../../../scripts/ci-memory-guard.mjs')
    const result = evaluateRelativeMemoryGuard(
      { peakRssMb: 1000, steadyRssMb: 800 },
      { peakRssMb: 1050, steadyRssMb: 841 },
    )

    expect(result.thresholdPercent).toBe(5)
    expect(result.violations).toEqual([
      expect.objectContaining({ metric: 'steadyRssMb' }),
    ])
  })

  it('fails when 100 class add-delete cycles keep growing heap usage', async () => {
    const { buildSummary, evaluatePerformanceGuard } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'base:main'
    const currentLabel = 'current:feature'
    const summary = buildSummary({
      generatedAt: '2026-07-19T00:00:00.000Z',
      options: { buildRuns: 0, hmrRuns: 0, timeoutMs: 180000 },
      rows: [
        { version: baselineLabel, key: 'core-source-candidate-hot-update', memoryStability: { stable: true, growthPct: 0 } },
        { version: currentLabel, key: 'core-source-candidate-hot-update', memoryStability: { stable: false, growthPct: 6.25 } },
      ],
    }, baselineLabel, currentLabel)

    expect(evaluatePerformanceGuard(summary).violations).toContainEqual(expect.objectContaining({
      metric: 'memoryStability100Cycles',
    }))
  })

  it('keeps published baseline failures non-blocking when current rows pass', async () => {
    const { buildSummary } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'published:weapp-tailwindcss@next'
    const currentLabel = 'current:5.0.0-next.10'
    const summary = buildSummary({
      generatedAt: '2026-05-16T00:00:00.000Z',
      options: {
        buildRuns: 1,
        hmrRuns: 1,
        timeoutMs: 180000,
      },
      rows: [
        {
          version: baselineLabel,
          key: 'demo-weapp-vite-tailwindcss-v4__mp-weixin',
          error: 'published package does not support SCSS root entry',
        },
        {
          version: currentLabel,
          key: 'demo-weapp-vite-tailwindcss-v4__mp-weixin',
          project: 'demo/weapp-vite-tailwindcss-v4',
          target: 'mp-weixin',
          summary: {
            build: { median: 100 },
            hmr: { median: 50 },
          },
        },
      ],
    }, baselineLabel, currentLabel)

    expect(summary.errors).toHaveLength(1)
    expect(summary.baselineErrors).toHaveLength(1)
    expect(summary.currentErrors).toHaveLength(0)
  })

  it('separates real watch HMR from fallback and unsupported rows', async () => {
    const { buildSummary, toMarkdown } = await import('../../../../benchmark/version-compare/scripts/ci-report.mjs')
    const baselineLabel = 'published:weapp-tailwindcss@next'
    const currentLabel = 'current:5.0.0-next.10'
    const summary = buildSummary({
      generatedAt: '2026-05-16T00:00:00.000Z',
      options: {
        buildRuns: 1,
        hmrRuns: 1,
        timeoutMs: 180000,
      },
      rows: [
        {
          version: baselineLabel,
          key: 'demo-weapp-vite-tailwindcss-v4__mp-weixin',
          project: 'demo/weapp-vite-tailwindcss-v4',
          target: 'mp-weixin',
          hmrMode: 'watch',
          summary: {
            build: { median: 100 },
            hmr: { p95: 20 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-weapp-vite-tailwindcss-v4__mp-weixin',
          project: 'demo/weapp-vite-tailwindcss-v4',
          target: 'mp-weixin',
          hmrMode: 'watch',
          summary: {
            build: { median: 110 },
            hmr: { p95: 10 },
          },
        },
        {
          version: baselineLabel,
          key: 'demo-uni-app-vite-tailwindcss-v4__mp-weixin',
          project: 'demo/uni-app-vite-tailwindcss-v4',
          target: 'mp-weixin',
          hmrMode: 'fallback-build',
          hmrNote: 'fallback',
          summary: {
            build: { median: 200 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-uni-app-vite-tailwindcss-v4__mp-weixin',
          project: 'demo/uni-app-vite-tailwindcss-v4',
          target: 'mp-weixin',
          hmrMode: 'fallback-build',
          hmrNote: 'fallback',
          summary: {
            build: { median: 200 },
          },
        },
        {
          version: baselineLabel,
          key: 'demo-web-react-vite-tailwindcss-v4__web',
          project: 'demo/web/react-vite-tailwindcss-v4',
          target: 'web',
          hmrMode: 'unsupported',
          hmrNote: 'web browser hmr',
          summary: {
            build: { median: 300 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-web-react-vite-tailwindcss-v4__web',
          project: 'demo/web/react-vite-tailwindcss-v4',
          target: 'web',
          hmrMode: 'unsupported',
          hmrNote: 'web browser hmr',
          summary: {
            build: { median: 300 },
          },
        },
      ],
    }, baselineLabel, currentLabel)

    expect(summary.averages.watchHmrCompareCount).toBe(1)
    expect(summary.averages.hmrDeltaPct).toBe(-50)
    const markdown = toMarkdown(summary, 'next')
    expect(markdown).toContain('| 项目 | 目标平台 | Baseline Build median(ms) |')
    expect(markdown).toContain('| demo-uni-app-vite-tailwindcss-v4__mp-weixin | mp-weixin |')
    expect(markdown).toContain('| demo-uni-app-vite-tailwindcss-v4__mp-weixin | mp-weixin | 200.00 | 200.00 | +0.00% | fallback-build | - | - | - |')
    expect(markdown).toContain('| demo-web-react-vite-tailwindcss-v4__web | web |')
    expect(markdown).toContain('fallback-build')
    expect(markdown).toContain('unsupported')
    expect(markdown).toContain('真实 watch HMR P95 平均变化：-50.00%（1 项；fallback-build/unsupported 不参与）')
  })
})
