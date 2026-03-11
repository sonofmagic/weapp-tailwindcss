import { spawn } from 'node:child_process'
import process from 'node:process'

const isWin = process.platform === 'win32'
const pnpmCmd = isWin ? 'pnpm.cmd' : 'pnpm'
const args = ['exec', 'weapp', 'build-npm', '-p']

const child = spawn(pnpmCmd, args, {
  stdio: ['ignore', 'inherit', 'inherit'],
  env: process.env,
  shell: isWin,
})

child.on('error', (error) => {
  console.error('[native-mina] failed to start weapp build-npm:', error)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
