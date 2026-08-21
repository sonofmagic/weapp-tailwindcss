import { spawn } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: repositoryRoot,
      env: process.env,
      stdio: 'inherit',
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`命令执行失败：${command} ${args.join(' ')}（code=${code ?? 'null'}, signal=${signal ?? 'null'}）`))
    })
  })
}

async function main() {
  const branch = process.env.WORKERS_CI_BRANCH
  if (branch && branch !== 'main') {
    throw new Error(`生产文档 Worker 仅允许从 main 部署，当前分支为 ${branch}`)
  }

  await run(packageManager, ['--filter', '@weapp-tailwindcss/website', 'deploy:worker'])
  await run(packageManager, ['--filter', '@weapp-tailwindcss/website', 'verify:deployment', '--', 'https://tw.icebreaker.top'])
  await run(packageManager, ['--filter', '@weapp-tailwindcss/website', 'verify:deployment', '--', 'https://weapp-tw.icebreaker.top', '--canonical-origin', 'https://tw.icebreaker.top'])
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
