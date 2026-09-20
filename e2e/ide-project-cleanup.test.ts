import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { closeWechatProject } from '../scripts/wechat-project-cleanup'

vi.mock('execa', () => ({ execa: vi.fn() }))

const root = fileURLToPath(new URL('..', import.meta.url))
const entries = [
  'e2e/framework-ide-support.test.ts',
  'e2e/frameworkIdeProbe.ts',
  'e2e/issue-909-ide.test.ts',
  'e2e/where-selector-ide.test.ts',
  'e2e/root-selector-ide.test.ts',
  'e2e/templates-ide-smoke.test.ts',
  'e2e/projectBuild.ts',
  'scripts/demo-visual-e2e-report/ide.ts',
]

describe('IDE project ownership', () => {
  beforeEach(() => {
    vi.stubEnv('E2E_PREFLIGHT_WECHAT_CLI', 'bound-wechat-cli')
    vi.mocked(execa).mockReset().mockResolvedValue({} as never)
  })

  afterEach(() => vi.unstubAllEnvs())

  it.each(['/owned/project with spaces', 'C:\\owned\\project with spaces', 'C:\\', './owned-project'])('closes only the supplied project: %s', async (project) => {
    const disconnect = vi.fn()
    await closeWechatProject(project, { disconnect }, 1234)
    expect(disconnect).toHaveBeenCalledOnce()
    expect(execa).toHaveBeenCalledExactlyOnceWith('bound-wechat-cli', ['close', '--project', project], { timeout: 1234 })
    expect(disconnect.mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(execa).mock.invocationCallOrder[0]!)
  })

  it('closes a partially launched project without an automator connection', async () => {
    await closeWechatProject('/owned/project')
    expect(execa).toHaveBeenCalledExactlyOnceWith('bound-wechat-cli', ['close', '--project', '/owned/project'], { timeout: 10_000 })
  })

  it('attempts project closure even if disconnect fails', async () => {
    const error = new Error('disconnect failed')
    const disconnect = () => {
      throw error
    }
    await expect(closeWechatProject('/owned/project', { disconnect })).rejects.toBe(error)
    expect(execa).toHaveBeenCalledOnce()
  })

  it('reports CLI failure without escalating to application termination', async () => {
    const error = new Error('project close timed out')
    vi.mocked(execa).mockRejectedValue(error)
    await expect(closeWechatProject('/owned/project')).rejects.toBe(error)
    expect(execa).toHaveBeenCalledOnce()
  })

  it('rejects an unspecified project before touching the IDE', async () => {
    await expect(closeWechatProject(' ')).rejects.toThrow('项目路径')
    expect(execa).not.toHaveBeenCalled()
  })

  it.each(entries)('%s never terminates the shared IDE application', async (entry) => {
    const source = await readFile(path.join(root, entry), 'utf8')
    expect(source).not.toMatch(/quit app|['"]pkill['"]|miniProgram\??\.close\(/)
  })
})
