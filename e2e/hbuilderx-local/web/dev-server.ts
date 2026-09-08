import type { ChildProcess } from 'node:child_process'
import process from 'node:process'
import { createHBuilderXProjectAlias } from '../../../scripts/hbuilderx-project-alias.mjs'
import { createLocalHBuilderXRunner, pollIntervalMs, serverTimeoutMs, spawnPnpm, wait } from '../process'

let devProcess: ChildProcess | undefined

export function getDevProcess() {
  return devProcess
}

export function clearDevProcess() {
  devProcess = undefined
}

function unsetVitestEnv(env: Record<string, string | undefined>) {
  env.VITEST = undefined
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('VITEST_')) {
      env[key] = undefined
    }
  }
  return env
}

export function createDevServer(projectRoot: string, port: number) {
  const childEnv = unsetVitestEnv({
    BROWSER: 'none',
    BROWSERSLIST_ENV: 'development',
    NODE_ENV: 'development',
    WEAPP_TW_HMR_TIMING: '1',
    WEAPP_TW_WATCH_REGRESSION: '1',
    VITE_WEAPP_TW_WATCH_REGRESSION: '1',
    HOST: '127.0.0.1',
    PORT: String(port),
    UNI_CLI_SERVER_HOST: '127.0.0.1',
    UNI_CLI_SERVER_PORT: String(port),
    CHOKIDAR_USEPOLLING: process.env['CHOKIDAR_USEPOLLING'] ?? '1',
    CHOKIDAR_INTERVAL: process.env['CHOKIDAR_INTERVAL'] ?? '50',
  })

  const child = spawnPnpm(projectRoot, [
    'exec',
    'cross-env',
    'WEAPP_TW_HMR_TIMING=1',
    'UNI_INPUT_DIR=.',
    'uni',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
  ], childEnv)
  devProcess = child
  return child
}

export async function createHBuilderXDevServer(projectRoot: string) {
  const env = unsetVitestEnv({
    BROWSER: 'none',
    WEAPP_TW_HMR_TIMING: '1',
    WEAPP_TW_WATCH_REGRESSION: '1',
    VITE_WEAPP_TW_WATCH_REGRESSION: '1',
  })
  const hbuilderx = await createLocalHBuilderXRunner(projectRoot, env)
  const identity = await createHBuilderXProjectAlias(projectRoot, process.env['E2E_HBUILDERX_ALIAS_ROOT'])
  const projectOptions = { cwd: identity.projectPath, env, timeoutMs: serverTimeoutMs }
  let closePromise: ReturnType<typeof hbuilderx.closeProject> | undefined
  const closeProject = () => {
    closePromise ??= hbuilderx.closeProject({ ...projectOptions, allowFailure: false })
    return closePromise
  }
  const cleanup = async () => {
    try {
      await closeProject()
    }
    finally {
      await identity.cleanup()
    }
  }
  try {
    await hbuilderx.openProject(projectOptions)
    const startedAt = Date.now()
    let registered = false
    while (Date.now() - startedAt < serverTimeoutMs) {
      const listed = await hbuilderx.run({ ...projectOptions, args: ['project', 'list'] })
      if (listed.output.includes(` - ${identity.projectName}(`)) {
        registered = true
        break
      }
      await wait(pollIntervalMs)
    }
    if (!registered) {
      throw new Error(`等待 HBuilderX 项目注册超时：${identity.projectPath}`)
    }
    const launch = hbuilderx.spawn({
      args: ['launch', 'web', '--project', identity.projectName, '--browser', 'Chrome'],
      cwd: projectRoot,
      env,
    })
    devProcess = launch.child
    return {
      ...launch,
      async stopServer() {
        try {
          // 先让 IDE 释放运行会话，再回收 CLI 进程；强杀不能替代项目生命周期。
          await closeProject()
          const exit = await Promise.race([launch.closed, wait(5000).then(() => undefined)])
          return { exitedBeforeKill: exit !== undefined, exit }
        }
        finally {
          await launch.stop()
        }
      },
      cleanup,
    }
  }
  catch (error) {
    await cleanup()
    throw error
  }
}
