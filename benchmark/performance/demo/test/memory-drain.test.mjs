import process from 'node:process'
import { expect, it, vi } from 'vitest'

const sampler = vi.hoisted(() => ({ sample: vi.fn() }))
vi.mock('../memory.mjs', () => ({ samplePosixMemory: sampler.sample }))

const { startProcess } = await import('../process.mjs')

it.runIf(process.platform !== 'win32')('退出后接收已发出的内存采样，不将等待采样计入构建耗时', async () => {
  const observation = Promise.withResolvers()
  sampler.sample.mockReturnValue(observation.promise)
  const session = await startProcess(process.execPath, ['-e', 'process.stdout.write("done")'])
  let resolved = false
  const completion = session.complete().then(result => { resolved = true; return result })
  try {
    await vi.waitFor(() => expect(session.log()).toBe('done'))
    await vi.waitFor(() => expect(() => session.ensureRunning()).toThrow())
    expect(resolved).toBe(false)
    const beforeObservation = performance.now() - session.startedAt
    observation.resolve(64)
    const result = await completion
    expect(result.peakRssMb).toBe(64)
    expect(result.ms).toBeLessThanOrEqual(beforeObservation)
  }
  finally { observation.resolve(null); await completion; await session.stop() }
})
