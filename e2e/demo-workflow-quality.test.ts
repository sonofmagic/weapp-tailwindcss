import { EventEmitter } from 'node:events'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { runDemoE2eWorkflow } from '../scripts/demo-e2e-workflow'

const mocks = vi.hoisted(() => ({
  enter: vi.fn(),
  spawn: vi.fn(),
  writeReport: vi.fn(),
}))

vi.mock('node:child_process', () => ({ spawn: mocks.spawn }))
vi.mock('../scripts/e2e-preflight/gate', () => ({ enterFullTestGate: mocks.enter }))
vi.mock('../scripts/demo-e2e-memory', async importOriginal => ({
  ...await importOriginal<typeof import('../scripts/demo-e2e-memory')>(),
  sampleProcessTree: () => undefined,
  writeDemoE2eMemoryReport: mocks.writeReport,
}))

describe('本地质量验证的全面测试门禁', () => {
  const events: string[] = []
  const gate = {
    env: { E2E_PREFLIGHT_WECHAT_CLI: 'verified-wechat-cli' },
    check: vi.fn(async (stage: string) => { events.push(`check:${stage}`) }),
    close: vi.fn(async () => { events.push('close') }),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    events.length = 0
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
    mocks.enter.mockImplementation(async () => {
      events.push('claim')
      return gate
    })
    mocks.writeReport.mockResolvedValue({ markdownFile: 'quality-report.md' })
    mocks.spawn.mockImplementation((_command: string, args: string[]) => {
      events.push(`spawn:${args.join(' ')}`)
      const child = new EventEmitter()
      queueMicrotask(() => child.emit('close', 0))
      return child
    })
  })

  afterEach(() => vi.restoreAllMocks())

  it('拒绝不含本地门禁的 quality 请求，且不启动任何命令', async () => {
    await expect(runDemoE2eWorkflow(['--quality'])).rejects.toThrow('--quality 必须配合 --local')
    expect(mocks.enter).not.toHaveBeenCalled()
    expect(mocks.spawn).not.toHaveBeenCalled()
  })

  it('门禁失败时不启动质量或设备步骤', async () => {
    mocks.enter.mockRejectedValueOnce(new Error('本轮预检未通过'))
    await expect(runDemoE2eWorkflow(['--local', '--quality'])).rejects.toThrow('本轮预检未通过')
    expect(mocks.enter).toHaveBeenCalledWith(undefined)
    expect(mocks.spawn).not.toHaveBeenCalled()
    expect(gate.close).not.toHaveBeenCalled()
  })

  it('先验证质量，再执行完整平台步骤，并共用一次门禁和环境绑定', async () => {
    await runDemoE2eWorkflow(['--local', '--quality', '--preflight-report', 'current-report.json'])
    const commands = mocks.spawn.mock.calls.map(([command, args]) => [command, ...args].join(' '))
    expect(commands.slice(0, 9)).toEqual([
      'pnpm build',
      'pnpm test --update=none',
      'pnpm lint',
      'pnpm typecheck',
      'pnpm architecture:check',
      'pnpm --filter @weapp-tailwindcss/website build',
      'pnpm agents:check',
      'pnpm release status',
      'git diff --check',
    ])
    expect(commands.slice(9)).toEqual([
      'pnpm exec vitest run -c ./e2e/vitest.e2e.config.ts e2e/e2e-matrix.test.ts',
      'pnpm e2e:mp:ide',
      'pnpm e2e:mp',
      'pnpm e2e:h5',
      'pnpm e2e:hbuilderx:mp',
      'pnpm e2e:hbuilderx:h5',
      'pnpm e2e:android',
      'pnpm e2e:ios',
      'pnpm e2e:harmony',
    ])
    expect(mocks.enter).toHaveBeenCalledExactlyOnceWith('current-report.json')
    expect(gate.close).toHaveBeenCalledTimes(1)
    expect(events[0]).toBe('claim')
    expect(events.at(-1)).toBe('close')
    for (let index = 1; index < events.length - 1; index += 2) {
      expect(events[index]).toMatch(/^check:/)
      expect(events[index + 1]).toMatch(/^spawn:/)
    }
    for (const [, , options] of mocks.spawn.mock.calls) {
      expect(options.env.E2E_PREFLIGHT_WECHAT_CLI).toBe(gate.env.E2E_PREFLIGHT_WECHAT_CLI)
    }
  })

  it('质量步骤失败时记录失败并释放门禁，不继续设备验收', async () => {
    mocks.spawn.mockImplementationOnce(() => {
      const child = new EventEmitter()
      queueMicrotask(() => child.emit('close', 2))
      return child
    })
    await expect(runDemoE2eWorkflow(['--local', '--quality'])).rejects.toThrow('quality root build failed with exit=2')
    expect(mocks.spawn).toHaveBeenCalledTimes(1)
    expect(mocks.writeReport.mock.calls.at(-1)?.[0].report.exitCode).toBe(1)
    expect(mocks.writeReport.mock.calls.at(-1)?.[0].report.steps[0].exitCode).toBe(2)
    expect(gate.close).toHaveBeenCalledTimes(1)
  })

  it('阶段复查失败时不启动该阶段，并释放门禁', async () => {
    gate.check.mockRejectedValueOnce(new Error('环境已失效'))
    await expect(runDemoE2eWorkflow(['--local', '--quality'])).rejects.toThrow('环境已失效')
    expect(mocks.spawn).not.toHaveBeenCalled()
    expect(gate.close).toHaveBeenCalledTimes(1)
  })

  it('默认 hosted 工作流不新增质量步骤或本地门禁', async () => {
    await runDemoE2eWorkflow([])
    expect(mocks.enter).not.toHaveBeenCalled()
    expect(mocks.spawn).toHaveBeenCalledTimes(4)
    expect(mocks.spawn.mock.calls[0]?.[1]).toEqual(['exec', 'vitest', 'run', '-c', './e2e/vitest.e2e.config.ts', 'e2e/e2e-matrix.test.ts'])
  })
})
