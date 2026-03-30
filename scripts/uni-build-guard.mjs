import { spawn } from 'node:child_process'
import process from 'node:process'

const strictUniBuild = process.env.UNI_BUILD_STRICT === '1'
const skipInteractiveUniBuild = process.env.WEAPP_TW_SKIP_INTERACTIVE_UNI_BUILD === '1'
const isInteractive = Boolean(process.stdout.isTTY && process.stderr.isTTY)
const forwardedArgs = process.argv.slice(2)
const isWin = process.platform === 'win32'
const uniBin = isWin ? 'uni.cmd' : 'uni'

if (!strictUniBuild && (skipInteractiveUniBuild || !isInteractive)) {
  const reason = skipInteractiveUniBuild ? '聚合构建模式' : '非交互式环境'
  console.warn(`[uni-build-guard] 检测到${reason}，已跳过 uni-app 的真实构建。`)
  console.warn('[uni-build-guard] 如需严格执行，请在交互式终端运行，或显式设置 UNI_BUILD_STRICT=1。')
  process.exit(0)
}

const child = spawn(uniBin, forwardedArgs, {
  stdio: 'inherit',
  env: process.env,
  shell: isWin,
})

child.on('error', (error) => {
  console.error('[uni-build-guard] 启动 uni build 失败:', error)
  process.exit(strictUniBuild ? 1 : 0)
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
