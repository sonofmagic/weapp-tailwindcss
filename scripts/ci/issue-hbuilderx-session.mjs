import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'

export function resolveManagedIdeCli(cli, temporary, paths = path) {
  if (!cli || !temporary || !paths.isAbsolute(cli) || !paths.isAbsolute(temporary)) {
    throw new Error('Windows IDE 会话缺少绝对 CLI 路径或 runner 临时目录')
  }
  const relative = paths.relative(temporary, cli)
  if (paths.isAbsolute(relative) || relative === '..' || relative.startsWith(`..${paths.sep}`)) {
    throw new Error('拒绝接管 runner 临时目录以外的 HBuilderX')
  }
  return paths.resolve(cli)
}

/** 仅管理 GitHub Windows 临时安装目录中的 IDE，不接管开发者桌面会话。 */
export async function createManagedIdeSession(artifactRoot, name) {
  if (process.platform !== 'win32' || process.env.GITHUB_ACTIONS !== 'true') {
    return { start: async () => {}, stop: async () => {} }
  }
  const cli = resolveManagedIdeCli(process.env.HBUILDERX_CLI_PATH, process.env.RUNNER_TEMP)
  const cleanupScript = fileURLToPath(new URL('./issue-hbuilderx-session.ps1', import.meta.url))
  const evidence = []
  const persist = () => writeFile(path.join(artifactRoot, `${name}-ide-session.json`), JSON.stringify(evidence, null, 2))
  async function diagnose() {
    await execa('pwsh', ['-NoProfile', '-File', fileURLToPath(new URL('./issue-hbuilderx-diagnostics.ps1', import.meta.url))], {
      timeout: 30_000,
      env: { E2E_HBUILDERX_DIAGNOSTIC_DIR: path.join(artifactRoot, `${name}-startup`) },
    }).catch(error => console.error('IDE 启动现场采集失败', error.message))
  }
  async function stop() {
    const result = await execa('pwsh', ['-NoProfile', '-File', cleanupScript, '-CliPath', cli], { timeout: 45_000 })
    evidence.push({ action: 'stop', processes: JSON.parse(result.stdout) })
    await persist()
  }
  return {
    async start() {
      // 插件安装与每个场景各自拥有 IDE 会话；不把上轮插件宿主状态带入新场景。
      await stop()
      const startedAt = Date.now()
      try {
        await execa(cli, ['open'], { timeout: 30_000 })
        const deadline = Date.now() + 60_000
        while (Date.now() < deadline) {
          // 命令查询共享注册阶段的总预算，不能被更短的嵌套超时提前终止。
          const result = await execa(cli, ['help'], { timeout: Math.max(1, deadline - Date.now()) })
          if (/launch web/.test(result.stdout)) {
            evidence.push({ action: 'ready', time: new Date().toISOString(), durationMs: Date.now() - startedAt })
            await persist()
            return
          }
          await delay(500)
        }
        throw new Error('本轮 IDE 插件命令未在限定时间内注册')
      }
      catch (error) {
        evidence.push({ action: 'startup-failed', durationMs: Date.now() - startedAt, message: error.message })
        await persist()
        await diagnose()
        throw error
      }
    },
    stop,
  }
}
