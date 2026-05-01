import { describe, expect, it } from 'vitest'
import { pushConcurrentTaskFactories, runWithConcurrency } from '@/bundlers/shared/run-tasks'

describe('bundlers/shared run tasks', () => {
  it('returns an empty result for empty factories and ignores empty queues', async () => {
    await expect(runWithConcurrency([])).resolves.toEqual([])
    const queue: Array<Promise<void>> = []
    pushConcurrentTaskFactories(queue, [])
    expect(queue).toHaveLength(0)
  })

  it('runs factories with a positive concurrency limit and keeps result order', async () => {
    let active = 0
    let maxActive = 0
    const factories = [3, 1, 2].map(value => async () => {
      active++
      maxActive = Math.max(maxActive, active)
      await Promise.resolve()
      active--
      return value
    })

    await expect(runWithConcurrency(factories, 0)).resolves.toEqual([3, 1, 2])
    expect(maxActive).toBe(1)
  })

  it('pushes a queue task that resolves after all factories finish', async () => {
    const calls: string[] = []
    const queue: Array<Promise<void>> = []
    pushConcurrentTaskFactories(queue, [
      async () => {
        calls.push('a')
      },
      async () => {
        calls.push('b')
      },
    ], 2)

    expect(queue).toHaveLength(1)
    await queue[0]
    expect(calls.sort()).toEqual(['a', 'b'])
  })
})
