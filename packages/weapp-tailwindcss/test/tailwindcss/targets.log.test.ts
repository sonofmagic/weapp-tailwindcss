import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
}

vi.mock('@weapp-tailwindcss/logger', () => ({
  logger: mockLogger,
}))

describe('logTailwindcssTarget', () => {
  beforeEach(() => {
    mockLogger.info.mockReset()
    mockLogger.warn.mockReset()
  })

  it('在 runtime 场景输出精简日志', async () => {
    const { logTailwindcssTarget } = await import('@/tailwindcss/targets')

    logTailwindcssTarget('runtime', {
      packageInfo: {
        rootPath: '/repo/node_modules/tailwindcss',
        version: '3.4.19',
      },
    } as any, '/repo')

    expect(mockLogger.info).toHaveBeenCalledWith('%s 使用 Tailwind CSS%s', 'Weapp-tailwindcss', ' (v3.4.19)')
  })

  it('在 cli 场景保留目标路径日志', async () => {
    const { logTailwindcssTarget } = await import('@/tailwindcss/targets')

    logTailwindcssTarget('cli', {
      packageInfo: {
        rootPath: '/repo/node_modules/tailwindcss',
        version: '3.4.19',
      },
    } as any, '/repo')

    expect(mockLogger.info).toHaveBeenCalledWith(
      '%s 绑定 Tailwind CSS -> %s%s',
      'weapp-tw patch',
      'node_modules/tailwindcss',
      ' (v3.4.19)',
    )
  })
})
