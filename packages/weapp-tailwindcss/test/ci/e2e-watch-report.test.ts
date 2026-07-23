import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const {
  buildSuggestions,
  scoreAttribution,
} = require('../../../../.github/scripts/e2e-watch-report.cjs') as {
  buildSuggestions: (scores: Array<[string, number]>) => {
    top: string[]
    fixSteps: string[]
    tests: string[]
  }
  scoreAttribution: (
    primary: { error: string, phase: string },
    evidence: {
      tokenAnomalies: unknown[]
      tokenCount: number
      hasTokenEvidence: boolean
      escapedCount: number
      wxssEscapedHits: number
      failureLogJoined: string
    },
  ) => Array<[string, number]>
}

describe('e2e-watch 根因归因', () => {
  it('将纯插件处理预算失败归因到性能预算而不是 token 提取', () => {
    const scores = scoreAttribution(
      {
        error: 'weapp-tailwindcss processing exceeded budget: 18890ms > 18000ms',
        phase: 'rollback',
      },
      {
        tokenAnomalies: [],
        tokenCount: 0,
        hasTokenEvidence: false,
        escapedCount: 0,
        wxssEscapedHits: 0,
        failureLogJoined: '',
      },
    )

    expect(scores[0]).toEqual(['性能预算超限', 5])
    expect(scores).toContainEqual(['cache key/invalidation', 0])
    expect(scores).toContainEqual(['token extraction', 0])
    expect(scores).toContainEqual(['进程/超时问题', 0])
    const suggestions = buildSuggestions(scores)
    expect(suggestions.top).toEqual(['性能预算超限'])
    expect(suggestions.fixSteps).toEqual([
      expect.stringContaining('独立插件处理预算'),
    ])
  })

  it('保留有产物证据时的空 token 提取归因', () => {
    const scores = scoreAttribution(
      { error: 'class token missing', phase: 'hot-update' },
      {
        tokenAnomalies: [],
        tokenCount: 0,
        hasTokenEvidence: true,
        escapedCount: 0,
        wxssEscapedHits: 0,
        failureLogJoined: '',
      },
    )

    expect(scores[0]).toEqual(['token extraction', 3])
  })
})
