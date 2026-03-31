import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockLogger = {
  info: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
}

const mockPc = {
  cyanBright: (value: string) => value,
  underline: (value: string) => value,
  bold: (value: string) => value,
  green: (value: string) => value,
}

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: mockLogger,
  pc: mockPc,
}))

describe('runtime tailwindcss logs', () => {
  beforeEach(async () => {
    mockLogger.info.mockReset()
    mockLogger.success.mockReset()
    mockLogger.warn.mockReset()
    const { __resetRuntimeTailwindcssLogsForTests } = await import('@/tailwindcss/runtime-logs')
    __resetRuntimeTailwindcssLogsForTests()
  })

  it('对相同版本成功日志只输出一次', async () => {
    const { logRuntimeTailwindcssVersion } = await import('@/tailwindcss/runtime-logs')

    logRuntimeTailwindcssVersion('/repo', '/repo/node_modules/tailwindcss', '3.4.19')
    logRuntimeTailwindcssVersion('/repo', '/repo/node_modules/tailwindcss', '3.4.19')

    expect(mockLogger.success).toHaveBeenCalledTimes(1)
  })

  it('对未安装提示只输出一次', async () => {
    const { logRuntimeTailwindcssVersion } = await import('@/tailwindcss/runtime-logs')

    logRuntimeTailwindcssVersion('/repo', undefined, undefined)
    logRuntimeTailwindcssVersion('/repo', undefined, undefined)

    expect(mockLogger.warn).toHaveBeenCalledTimes(1)
  })
})
