import { spawn } from 'node:child_process'
import process from 'node:process'

const isWin = process.platform === 'win32'
const pnpmCmd = isWin ? 'pnpm.cmd' : 'pnpm'
const args = ['exec', 'weapp', 'build-npm', '-p']
const strictWechatCli = process.env.WEAPP_IDE_STRICT === '1'
let output = ''

const child = spawn(pnpmCmd, args, {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: process.env,
  shell: isWin,
})

child.stdout.on('data', (chunk) => {
  const text = chunk.toString()
  output += text
  process.stdout.write(text)
})

child.stderr.on('data', (chunk) => {
  const text = chunk.toString()
  output += text
  process.stderr.write(text)
})

child.on('error', (error) => {
  console.error('[native-mina] failed to start weapp build-npm:', error)
  process.exit(strictWechatCli ? 1 : 0)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  if (code === 0) {
    process.exit(0)
    return
  }

  const isSandboxPermissionIssue
    = output.includes('listen EPERM: operation not permitted 127.0.0.1:3799')
      || output.includes('#initialize-error')
      || output.includes('operation not permitted')

  if (!strictWechatCli && isSandboxPermissionIssue) {
    console.warn('[native-mina] 微信开发者工具 CLI 在当前受限环境中无法完成 build-npm，已跳过。')
    console.warn('[native-mina] 如需本地严格校验，请在可访问微信开发者工具的环境下执行 `WEAPP_IDE_STRICT=1 pnpm --filter @weapp-tailwindcss-demo/native-mina build`。')
    process.exit(0)
    return
  }

  process.exit(code ?? 1)
})
