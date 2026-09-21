import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'

interface Connection {
  disconnect: () => void
}

export async function closeWechatProject(projectPath: string, connection?: Connection, timeoutMs = 10_000) {
  if (!projectPath.trim()) {
    throw new Error('微信 IDE 清理必须指定本次测试的项目路径。')
  }
  const cli = process.env.E2E_PREFLIGHT_WECHAT_CLI
    ?? (process.platform === 'darwin'
      ? path.join(path.parse(os.homedir()).root, 'Applications', 'wechatwebdevtools.app', 'Contents', 'MacOS', 'cli')
      : undefined)
  if (!cli) {
    connection?.disconnect()
    throw new Error('请设置 E2E_PREFLIGHT_WECHAT_CLI，以便只关闭本次微信 IDE 项目。')
  }
  try {
    connection?.disconnect()
  }
  finally {
    // CLI 的项目关闭命令不退出共享 IDE，也不终止其他项目进程。
    await execa(cli, ['close', '--project', projectPath], { timeout: timeoutMs })
  }
}
