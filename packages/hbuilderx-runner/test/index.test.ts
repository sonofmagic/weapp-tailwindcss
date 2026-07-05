import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import {
  HBuilderXCommandError,
  classifyHBuilderXOutput,
  createLaunchArgs,
  createLogBuffer,
  extractHBuilderXExecutableFromProcessOutput,
  resolveHBuilderXCli,
  resolveHBuilderXCliInfo,
  runCommand,
} from '../src'

describe('hbuilderx-runner', () => {
  it('classifies common HBuilderX project recognition failures', () => {
    expect(classifyHBuilderXOutput('项目 /demo 不是 uni-app 项目，暂不支持').kind).toBe('project-not-uni-app')
    expect(classifyHBuilderXOutput('项目 /demo 项目类型为Web，暂不支持').kind).toBe('project-type-unsupported')
    expect(classifyHBuilderXOutput('failed to load config from vite.config.ts\nFailed to resolve entry for package "@x/y"').kind).toBe('config-load-failed')
    expect(classifyHBuilderXOutput('adb: command not found').kind).toBe('android-toolchain-missing')
    expect(classifyHBuilderXOutput('xcrun: error: unable to find utility "simctl"').kind).toBe('ios-toolchain-missing')
    expect(classifyHBuilderXOutput('hdc list targets failed').kind).toBe('harmony-toolchain-missing')
  })

  it('keeps a bounded recent log buffer', () => {
    const buffer = createLogBuffer(2)
    buffer.push('first')
    buffer.push('second')
    buffer.push('third')
    expect(buffer.logs).toEqual(['second', 'third'])
    expect(buffer.text()).toBe('secondthird')
  })

  it('resolves HBuilderX CLI from explicit candidates', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'hbuilderx-runner-'))
    const cli = path.join(dir, process.platform === 'win32' ? 'cli.cmd' : 'cli')
    await writeFile(cli, '', 'utf8')
    await expect(resolveHBuilderXCli([path.join(dir, 'missing'), cli])).resolves.toBe(cli)
    await expect(resolveHBuilderXCliInfo([cli], { HBUILDERX_CLI_PATH: cli } as NodeJS.ProcessEnv)).resolves.toMatchObject({
      path: cli,
      isRunning: false,
      source: 'env',
    })
  })

  it('extracts HBuilderX executables from process listings', () => {
    expect(extractHBuilderXExecutableFromProcessOutput(
      '123 ?? 0:01.23 /Applications/HBuilderX.app/Contents/MacOS/HBuilderX --type=renderer',
      'darwin',
    )).toBe('/Applications/HBuilderX.app/Contents/MacOS/HBuilderX')
    expect(extractHBuilderXExecutableFromProcessOutput(
      '123 ?? 0:01.23 /Applications/HBuilderX Alpha.app/Contents/MacOS/HBuilderX --type=renderer',
      'darwin',
    )).toBe('/Applications/HBuilderX Alpha.app/Contents/MacOS/HBuilderX')
    expect(extractHBuilderXExecutableFromProcessOutput(
      'Node,DESKTOP,123,C:\\Program Files\\HBuilderX\\HBuilderX.exe',
      'win32',
    )).toBe('C:\\Program Files\\HBuilderX\\HBuilderX.exe')
  })

  it('creates launch args with compile and runtime log flags', () => {
    expect(createLaunchArgs({
      cwd: '/demo/project',
      platform: 'mp-weixin',
      compile: false,
      runtimeLog: true,
    })).toEqual([
      'exec',
      'hbuilderx',
      'launch',
      'mp-weixin',
      '--project',
      path.resolve('/demo/project'),
      '--compile',
      'false',
      '--runtime-log',
      'true',
    ])
  })

  it('turns command timeout into a classified command error', async () => {
    await expect(runCommand({
      command: process.execPath,
      args: ['-e', 'setTimeout(() => {}, 5000)'],
      cwd: process.cwd(),
      timeoutMs: 100,
    })).rejects.toMatchObject({
      name: 'HBuilderXCommandError',
      result: {
        issue: {
          kind: 'timeout',
        },
      },
    } satisfies Partial<HBuilderXCommandError>)
  })

  it('includes classified output when commands fail', async () => {
    await expect(runCommand({
      command: process.execPath,
      args: ['-e', 'console.error("项目 /demo 不是 uni-app 项目，暂不支持"); process.exit(1)'],
      cwd: process.cwd(),
      timeoutMs: 5000,
    })).rejects.toMatchObject({
      result: {
        issue: {
          kind: 'project-not-uni-app',
        },
      },
    })
  })
})
