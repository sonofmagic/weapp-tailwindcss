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
        const packageJson = path.join(full, 'package.json')
        if (fs.existsSync(packageJson)) {
          return [path.relative(repoRoot, full).replaceAll(path.sep, '/')]
        }
        return collectPackageDirs(full)
      })
    }

    const demoProjects = collectPackageDirs(path.join(repoRoot, 'demo')).sort()
    const benchmarkProjectDirs = benchmarkProjects.map(project => project.project).sort()

    expect(benchmarkProjectDirs).toEqual(demoProjects)
    expect(benchmarkProjects.map(project => project.key)).toEqual(expect.arrayContaining([
      'demo-web-react-vite-tailwindcss-v4',
      'demo-web-vue-vite-tailwindcss-v4',
    ]))
    expect(benchmarkProjects.filter(project => project.key.includes('taro')).every(project => project.hmrMode === 'unsupported')).toBe(true)
  })

  it('keeps benchmark working copies free from stale build outputs', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const source = fs.readFileSync(path.resolve(__dirname, '../../../../benchmark/version-compare/scripts/run-ci.mjs'), 'utf8')

    expect(source).toContain("part === 'dist'")
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
          key: 'demo-weapp-vite-tailwindcss-v4',
          error: 'published package does not support SCSS root entry',
        },
        {
          version: currentLabel,
          key: 'demo-weapp-vite-tailwindcss-v4',
          project: 'demo/weapp-vite-tailwindcss-v4',
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
          key: 'demo-weapp-vite-tailwindcss-v4',
          project: 'demo/weapp-vite-tailwindcss-v4',
          hmrMode: 'watch',
          summary: {
            build: { median: 100 },
            hmr: { median: 20 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-weapp-vite-tailwindcss-v4',
          project: 'demo/weapp-vite-tailwindcss-v4',
          hmrMode: 'watch',
          summary: {
            build: { median: 110 },
            hmr: { median: 10 },
          },
        },
        {
          version: baselineLabel,
          key: 'demo-uni-app-vite-tailwindcss-v4',
          project: 'demo/uni-app-vite-tailwindcss-v4',
          hmrMode: 'fallback-build',
          hmrNote: 'fallback',
          summary: {
            build: { median: 200 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-uni-app-vite-tailwindcss-v4',
          project: 'demo/uni-app-vite-tailwindcss-v4',
          hmrMode: 'fallback-build',
          hmrNote: 'fallback',
          summary: {
            build: { median: 200 },
          },
        },
        {
          version: baselineLabel,
          key: 'demo-web-react-vite-tailwindcss-v4',
          project: 'demo/web/react-vite-tailwindcss-v4',
          hmrMode: 'unsupported',
          hmrNote: 'web browser hmr',
          summary: {
            build: { median: 300 },
          },
        },
        {
          version: currentLabel,
          key: 'demo-web-react-vite-tailwindcss-v4',
          project: 'demo/web/react-vite-tailwindcss-v4',
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
    expect(markdown).toContain('| demo-uni-app-vite-tailwindcss-v4 |')
    expect(markdown).toContain('| demo-uni-app-vite-tailwindcss-v4 | 200.00 | 200.00 | +0.00% | fallback-build | - | - | - |')
    expect(markdown).toContain('| demo-web-react-vite-tailwindcss-v4 |')
    expect(markdown).toContain('fallback-build')
    expect(markdown).toContain('unsupported')
    expect(markdown).toContain('真实 watch HMR 稳态中位数平均变化：-50.00%（1 项；fallback-build/unsupported 不参与）')
  })
})
