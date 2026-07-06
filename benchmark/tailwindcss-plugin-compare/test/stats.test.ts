import { median, percentile, summarize } from '../src/stats'

describe('stats', () => {
  it('handles empty values', () => {
    expect(median([])).toBe(0)
    expect(percentile([], 95)).toBe(0)
    expect(summarize([])).toEqual({
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      p75: 0,
      p95: 0,
    })
  })

  it('calculates median and percentile boundaries', () => {
    expect(median([5, 1, 3])).toBe(3)
    expect(median([4, 1, 2, 3])).toBe(2.5)
    expect(percentile([10, 20, 30, 40], 0)).toBe(10)
    expect(percentile([10, 20, 30, 40], 75)).toBe(30)
    expect(percentile([10, 20, 30, 40], 95)).toBe(40)
    expect(percentile([10, 20, 30, 40], 100)).toBe(40)
  })
})
