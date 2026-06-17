import { describe, expect, it } from 'vitest'
import {
  createDemoE2eMemoryReport,
  renderDemoE2eMemoryMarkdown,
  summarizeMemorySamples,
  type DemoE2eMemoryStepReport,
} from '../../scripts/demo-e2e-memory'

describe('demo e2e memory report', () => {
  it('summarizes process tree memory samples with a stable baseline and peak', () => {
    expect(summarizeMemorySamples([
      { at: 1000, rssMb: 40, maxProcessRssMb: 40, processCount: 1 },
      { at: 2000, rssMb: 180, maxProcessRssMb: 120, processCount: 3 },
      { at: 3000, rssMb: 260, maxProcessRssMb: 160, processCount: 4 },
    ])).toEqual({
      count: 3,
      baselineRssMb: 180,
      peakRssMb: 260,
      rssDeltaMb: 80,
      peakMaxProcessRssMb: 160,
      peakProcessCount: 4,
      firstAt: 1000,
      lastAt: 3000,
      durationMs: 2000,
    })
  })

  it('creates a workflow-level memory report and markdown table by step', () => {
    const steps: DemoE2eMemoryStepReport[] = [
      {
        name: 'matrix assertions',
        command: ['pnpm', 'exec', 'vitest'],
        exitCode: 0,
        startedAt: '2026-06-17T00:00:00.000Z',
        endedAt: '2026-06-17T00:00:01.000Z',
        local: false,
        samples: [
          { at: 1000, rssMb: 180, maxProcessRssMb: 120, processCount: 3 },
          { at: 2000, rssMb: 220, maxProcessRssMb: 140, processCount: 3 },
        ],
        summary: summarizeMemorySamples([
          { at: 1000, rssMb: 180, maxProcessRssMb: 120, processCount: 3 },
          { at: 2000, rssMb: 220, maxProcessRssMb: 140, processCount: 3 },
        ]),
      },
      {
        name: 'HBuilderX uni-app H5 HMR',
        command: ['pnpm', 'e2e:hbuilderx:h5'],
        exitCode: 1,
        startedAt: '2026-06-17T00:00:02.000Z',
        endedAt: '2026-06-17T00:00:04.000Z',
        local: true,
        samples: [
          { at: 3000, rssMb: 256, maxProcessRssMb: 180, processCount: 4 },
          { at: 4000, rssMb: 320, maxProcessRssMb: 210, processCount: 5 },
        ],
        summary: summarizeMemorySamples([
          { at: 3000, rssMb: 256, maxProcessRssMb: 180, processCount: 4 },
          { at: 4000, rssMb: 320, maxProcessRssMb: 210, processCount: 5 },
        ]),
      },
    ]

    const report = createDemoE2eMemoryReport({
      repositoryRoot: '/repo',
      includeLocal: true,
      exitCode: 1,
      generatedAt: '2026-06-17T00:00:05.000Z',
      steps,
    })

    expect(report.summary).toMatchObject({
      stepCount: 2,
      failedStepCount: 1,
      peakRssMb: 320,
      rssDeltaMb: 140,
      peakMaxProcessRssMb: 210,
      peakProcessCount: 5,
    })

    const markdown = renderDemoE2eMemoryMarkdown(report)
    expect(markdown).toContain('# Demo E2E 内存占用报告')
    expect(markdown).toContain('| matrix assertions | 0 | 2 | 180MB | 220MB | 40MB | 140MB | 3 | 1s | `pnpm exec vitest` |')
    expect(markdown).toContain('| HBuilderX uni-app H5 HMR (local) | 1 | 2 | 256MB | 320MB | 64MB | 210MB | 5 | 1s | `pnpm e2e:hbuilderx:h5` |')
  })
})
