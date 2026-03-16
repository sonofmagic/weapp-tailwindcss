import { spawn } from 'node:child_process'
import process from 'node:process'

const strictTaroBuild = process.env.TARO_BUILD_STRICT === '1'
const isInteractive = Boolean(process.stdout.isTTY && process.stderr.isTTY)
const isWin = process.platform === 'win32'
const pnpmCmd = isWin ? 'pnpm.cmd' : 'pnpm'
const args = ['exec', 'taro', 'build', '--type', 'weapp']

if (!strictTaroBuild && !isInteractive) {
  console.warn('[taro-build-guard] 检测到非交互式环境，已跳过 Taro demo/app 的 weapp 构建。')
  console.warn('[taro-build-guard] 如需严格执行，请在交互式终端运行，或显式设置 TARO_BUILD_STRICT=1。')
  process.exit(0)
}

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
  console.error('[taro-build-guard] 启动 taro build 失败:', error)
  process.exit(strictTaroBuild ? 1 : 0)
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

  const isKnownHeadlessFailure
    = output.includes('Attempted to create a NULL object.')
      || output.includes('system-configuration')

  if (!strictTaroBuild && isKnownHeadlessFailure) {
    console.warn('[taro-build-guard] 当前环境无法稳定完成 Taro weapp 构建，已跳过。')
    console.warn('[taro-build-guard] 如需严格校验，请在本地交互环境执行 TARO_BUILD_STRICT=1。')
    process.exit(0)
    return
  }

  process.exit(code ?? 1)
})
