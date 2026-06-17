import { describe, expect, it } from 'vitest'
import { createDemoE2eMemoryReport, summarizeMemorySamples } from '../../scripts/demo-e2e-memory'
import {
  collectWeappCases,
  createBuildEnv,
  createMemoryRecommendations,
  mergeProjectReports,
  renderIndexMarkdown,
  renderProjectMarkdown,
  summarizeReport,
  type ProjectReport,
} from '../../scripts/demo-weapp-memory-report'

describe('demo weapp memory report', () => {
  it('keeps report summary stable for build and hmr stages', () => {
    const report = createDemoE2eMemoryReport({
      repositoryRoot: '/repo',
      includeLocal: false,
      exitCode: 0,
      generatedAt: '2026-06-17T00:00:00.000Z',
      steps: [
        {
          name: 'demo build',
          command: ['pnpm', 'e2e:static'],
          exitCode: 0,
          startedAt: '2026-06-17T00:00:00.000Z',
          endedAt: '2026-06-17T00:00:01.000Z',
          local: false,
          samples: [
            { at: 1000, rssMb: 120, maxProcessRssMb: 80, processCount: 2 },
            { at: 2000, rssMb: 180, maxProcessRssMb: 90, processCount: 3 },
          ],
          summary: summarizeMemorySamples([
            { at: 1000, rssMb: 120, maxProcessRssMb: 80, processCount: 2 },
            { at: 2000, rssMb: 180, maxProcessRssMb: 90, processCount: 3 },
          ]),
        },
      ],
    })

    expect(report.summary).toMatchObject({
      stepCount: 1,
      failedStepCount: 0,
      peakRssMb: 180,
      rssDeltaMb: 0,
    })
  })

  it('builds per-demo markdown with optimization guidance', () => {
    const project: ProjectReport = {
      name: 'uni-app-vite-tailwindcss-v3',
      framework: 'uni-app',
      builder: 'vite',
      tailwindcss: 'v3',
      sourceShape: 'vue-sfc',
      platform: 'weapp',
      status: 'passed',
      stages: [
        {
          stage: 'build',
          status: 'passed',
          command: ['pnpm', 'e2e:static'],
          startedAt: '2026-06-17T00:00:00.000Z',
          endedAt: '2026-06-17T00:00:02.000Z',
          summary: summarizeMemorySamples([
            { at: 1000, rssMb: 150, maxProcessRssMb: 90, processCount: 2 },
            { at: 2000, rssMb: 210, maxProcessRssMb: 120, processCount: 3 },
          ]),
          samples: [],
        },
        {
          stage: 'hmr',
          status: 'passed',
          command: ['pnpm', 'e2e:hot-update:demo'],
          startedAt: '2026-06-17T00:00:03.000Z',
          endedAt: '2026-06-17T00:00:05.000Z',
          summary: summarizeMemorySamples([
            { at: 3000, rssMb: 220, maxProcessRssMb: 130, processCount: 3 },
            { at: 4000, rssMb: 280, maxProcessRssMb: 150, processCount: 4 },
          ]),
          samples: [],
        },
      ],
      recommendations: [],
    }
    project.recommendations = createMemoryRecommendations(project)

    const markdown = renderProjectMarkdown(project)
    expect(markdown).toContain('# uni-app-vite-tailwindcss-v3 微信小程序端内存报告')
    expect(markdown).toContain('## 优化建议')
    expect(markdown).toContain('优先用当前报告里的 peak RSS / RSS delta 锁定阶段')
    expect(markdown).toContain('检查 weapp-tailwindcss 配置是否把 content/@source 扫描范围放大到 dist、node_modules、unpackage 或跨 demo 目录')

    const summary = summarizeReport([project])
    expect(summary).toMatchObject({
      projectCount: 1,
      passedProjectCount: 1,
      failedProjectCount: 0,
      skippedProjectCount: 0,
      peakBuildRssMb: 210,
      peakHmrRssMb: 280,
      peakRssMb: 280,
      maxRssDeltaMb: 60,
    })

    const indexMarkdown = renderIndexMarkdown({
      generatedAt: '2026-06-17T00:00:00.000Z',
      repositoryRoot: '/repo',
      cases: [project],
      summary,
    })
    expect(indexMarkdown).toContain('Demo 微信小程序端内存报告汇总')
    expect(indexMarkdown).toContain('[uni-app-vite-tailwindcss-v3](./projects/uni-app-vite-tailwindcss-v3.md)')
  })

  it('selects only weapp-related demo cases', () => {
    const names = collectWeappCases().map(item => item.name)
    const uniApp = collectWeappCases().find(item => item.name === 'uni-app-vite-tailwindcss-v3')
    expect(names).toContain('weapp-vite-tailwindcss-v3')
    expect(names).toContain('uni-app-vite-tailwindcss-v3')
    expect(names).toContain('uni-app-vite-vue3-hbuilderx-tailwindcss-v3')
    expect(names).not.toContain('web/react-vite-tailwindcss-v3')
    expect(uniApp?.buildCommand).toEqual([
      'pnpm',
      '--filter',
      '@weapp-tailwindcss-demo/uni-app-vite-tailwindcss-v3',
      'run',
      'build:mp-weixin',
    ])
  })

  it('enables strict taro build env and merges staged reports', () => {
    expect(createBuildEnv({
      name: 'taro-vite-react-tailwindcss-v4',
      framework: 'taro-react',
      builder: 'vite',
      tailwindcss: 'v4',
      sourceShape: 'tsx',
      platform: 'weapp',
      buildCommand: [],
      automatedStatic: true,
      automatedHmr: true,
    })).toMatchObject({
      TARO_BUILD_STRICT: '1',
      WEAPP_TW_SKIP_INTERACTIVE_TARO_BUILD: '0',
    })

    const base: ProjectReport = {
      name: 'taro-vite-react-tailwindcss-v4',
      framework: 'taro-react',
      builder: 'vite',
      tailwindcss: 'v4',
      sourceShape: 'tsx',
      platform: 'weapp',
      status: 'partial',
      stages: [
        {
          stage: 'build',
          status: 'passed',
          command: ['pnpm', 'build'],
          summary: summarizeMemorySamples([{ at: 1, rssMb: 111, maxProcessRssMb: 111, processCount: 1 }]),
          samples: [],
        },
        {
          stage: 'hmr',
          status: 'skipped',
          command: [],
          reason: 'skip',
          summary: summarizeMemorySamples([]),
          samples: [],
        },
      ],
      recommendations: [],
    }
    const next: ProjectReport = {
      ...base,
      status: 'passed',
      stages: [
        {
          stage: 'build',
          status: 'passed',
          command: ['pnpm', 'build'],
          summary: summarizeMemorySamples([{ at: 1, rssMb: 222, maxProcessRssMb: 222, processCount: 1 }]),
          samples: [],
        },
        {
          stage: 'hmr',
          status: 'passed',
          command: ['pnpm', 'hmr'],
          summary: summarizeMemorySamples([{ at: 1, rssMb: 333, maxProcessRssMb: 333, processCount: 1 }]),
          samples: [],
        },
      ],
      recommendations: [],
    }

    const merged = mergeProjectReports([base], [next])
    expect(merged).toHaveLength(1)
    expect(merged[0]?.stages.find(stage => stage.stage === 'hmr')?.status).toBe('passed')
    expect(merged[0]?.stages.find(stage => stage.stage === 'build')?.summary.peakRssMb).toBe(222)
  })
})
