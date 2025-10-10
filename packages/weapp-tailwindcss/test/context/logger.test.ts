import type { LoggerLevel } from '@/context/logger'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockLogger = { level: 99 }

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: mockLogger,
  pc: {},
}))

describe('applyLoggerLevel', () => {
  beforeEach(() => {
    mockLogger.level = 99
  })

  it('applies mapped level when provided', async () => {
    const { applyLoggerLevel } = await import('@/context/logger')

    applyLoggerLevel('warn')
    expect(mockLogger.level).toBe(1)

    applyLoggerLevel('error')
    expect(mockLogger.level).toBe(0)

    applyLoggerLevel('silent')
    expect(mockLogger.level).toBe(-999)
  })

  it('falls back to info when level is omitted', async () => {
    const { applyLoggerLevel } = await import('@/context/logger')

    applyLoggerLevel()
    expect(mockLogger.level).toBe(3)
  })

  it('falls back to info when an unsupported level is supplied', async () => {
    const { applyLoggerLevel } = await import('@/context/logger')

    applyLoggerLevel('unsupported' as unknown as LoggerLevel)
    expect(mockLogger.level).toBe(3)
  })
})
