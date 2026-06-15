import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildHmrFullRunReport, summarizeHmrTimingSamples } from './hmrReport'

describe('hmr full run report', () => {
  it('summarizes hot-update timings by app and platform', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tailwindcss-hmr-report-'))
    try {
      const reportFile = path.join(root, 'weapp-vite-tailwindcss-v3.json')
      await writeFile(reportFile, JSON.stringify({
        hmrDurations: {
          byProject: {
            'weapp-vite-tailwindcss-v3': {
              name: 'weapp-vite-tailwindcss-v3',
              label: 'weapp vite Tailwind v3',
              project: 'weapp-vite-tailwindcss-v3',
              projectGroup: 'demo',
              initialReadyMs: 1000,
              totalMs: 3000,
              timings: [
                { surface: 'template:preferred-round', sourceFile: 'src/pages/index.wxml', hotUpdateEffectiveMs: 120, rollbackEffectiveMs: 90, hotUpdatePluginProcessMs: 12 },
                { surface: 'main-style:app', sourceFile: 'src/app.css', hotUpdateEffectiveMs: 80, rollbackEffectiveMs: 70, hotUpdatePluginProcessMs: 8 },
              ],
            },
          },
        },
      }), 'utf8')

      const report = await buildHmrFullRunReport({
        generatedAt: '2026-06-15T00:00:00.000Z',
        repositoryRoot: root,
        targetNames: ['demo'],
        reports: [{ caseName: 'weapp-vite-tailwindcss-v3', reportFile }],
      })

      expect(report.totalCases).toBe(1)
      expect(report.projectCount).toBe(1)
      expect(report.timingCount).toBe(2)
      expect(report.summary).toEqual({ count: 2, avgMs: 100, minMs: 80, maxMs: 120, p50Ms: 80, p95Ms: 120 })
      expect(report.byApp['weapp-vite-tailwindcss-v3']?.platforms['weapp']).toEqual(report.summary)
      expect(report.byPlatform['weapp']).toEqual(report.summary)
      expect(report.cases[0]).toMatchObject({
        caseName: 'weapp-vite-tailwindcss-v3',
        project: 'weapp-vite-tailwindcss-v3',
        platform: 'weapp',
        framework: 'weapp-vite',
        builder: 'vite',
        tailwindcss: 'v3',
        sourceShape: 'native',
        reportFile: 'weapp-vite-tailwindcss-v3.json',
        initialReadyMs: 1000,
        totalMs: 3000,
      })
    }
    finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('resolves uni-app full-run HMR to the mp-weixin platform from the hot-update command', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'weapp-tailwindcss-hmr-report-'))
    try {
      const reportFile = path.join(root, 'uni-app-vite-tailwindcss-v3.json')
      await writeFile(reportFile, JSON.stringify({
        hmrDurations: {
          byProject: {
            'uni-app-vite-tailwindcss-v3': {
              name: 'uni-app-vite-tailwindcss-v3',
              label: 'uni-app vite Tailwind v3',
              project: 'uni-app-vite-tailwindcss-v3',
              projectGroup: 'demo',
              initialReadyMs: 1000,
              totalMs: 3000,
              timings: [{ surface: 'template:preferred-round', hotUpdateEffectiveMs: 120 }],
            },
          },
        },
      }), 'utf8')

      const report = await buildHmrFullRunReport({
        generatedAt: '2026-06-15T00:00:00.000Z',
        repositoryRoot: root,
        targetNames: ['demo'],
        reports: [{ caseName: 'uni-app-vite-tailwindcss-v3', reportFile }],
      })

      expect(report.cases[0]?.platform).toBe('mp-weixin')
      expect(report.byApp['uni-app-vite-tailwindcss-v3']?.platforms['mp-weixin']).toEqual(report.summary)
    }
    finally {
      await rm(root, { force: true, recursive: true })
    }
  })

  it('keeps percentile summaries stable for empty and multi-sample inputs', () => {
    expect(summarizeHmrTimingSamples([])).toEqual({ count: 0, avgMs: 0, minMs: 0, maxMs: 0, p50Ms: 0, p95Ms: 0 })
    expect(summarizeHmrTimingSamples([
      { hotUpdateEffectiveMs: 30 },
      { hotUpdateEffectiveMs: 10 },
      { hotUpdateEffectiveMs: 20 },
    ])).toEqual({ count: 3, avgMs: 20, minMs: 10, maxMs: 30, p50Ms: 20, p95Ms: 30 })
  })
})
