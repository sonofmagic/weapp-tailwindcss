import { spawnSync } from 'node:child_process'
import { beforeEach, expect, it, vi } from 'vitest'
import { findRunningHBuilderXCliCandidates } from '../src/hbuilderx/discovery'

vi.mock('node:child_process', () => ({ spawnSync: vi.fn() }))
vi.mock('../src/fs', () => ({ fileExists: vi.fn(async () => true) }))

beforeEach(() => vi.resetAllMocks())

it('在没有 WMIC 的 Windows 上识别现有 IDE，保留中文、逗号与共享根目录', async () => {
  vi.mocked(spawnSync).mockImplementation(((command: string) => {
    if (command !== 'powershell.exe') {
      return { error: new Error('ENOENT'), status: null, stdout: '', stderr: '' }
    }
    return {
      status: 0,
      stdout: JSON.stringify(['C:\\中文, 空格 & IDE\\HBuilderX.exe', '\\\\server\\share\\HBuilderX.exe']),
      stderr: '',
    }
  }) as typeof spawnSync)
  await expect(findRunningHBuilderXCliCandidates('win32')).resolves.toEqual([
    'C:\\中文, 空格 & IDE\\cli.exe',
    '\\\\server\\share\\cli.exe',
  ])
})

it('进程探测失败不能伪装成没有运行实例', async () => {
  vi.mocked(spawnSync).mockReturnValue({ status: 1, stdout: '', stderr: 'CIM access denied' } as ReturnType<typeof spawnSync>)
  await expect(findRunningHBuilderXCliCandidates('win32')).rejects.toThrow('CIM access denied')
})

it('有效的空实例列表不报错', async () => {
  vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout: '[]\r\n', stderr: '' } as ReturnType<typeof spawnSync>)
  await expect(findRunningHBuilderXCliCandidates('win32')).resolves.toEqual([])
})

it.each(['not-json', 'null', '{"path":"C:/HBuilderX.exe"}'])('拒绝把损坏的探测结果当作没有实例：%s', async (stdout) => {
  vi.mocked(spawnSync).mockReturnValue({ status: 0, stdout, stderr: '' } as ReturnType<typeof spawnSync>)
  await expect(findRunningHBuilderXCliCandidates('win32')).rejects.toThrow()
})

it.each(['darwin', 'linux'] as const)('%s 保留系统进程查询与 POSIX 路径', async (platform) => {
  vi.mocked(spawnSync).mockImplementation(((command: string) => ({
    status: command === 'ps' ? 0 : 1,
    stdout: '/Applications/HBuilderX.app/Contents/MacOS/HBuilderX --argument\n',
    stderr: '',
  })) as typeof spawnSync)
  await expect(findRunningHBuilderXCliCandidates(platform)).resolves.toEqual(['/Applications/HBuilderX.app/Contents/MacOS/cli'])
})
