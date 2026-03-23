import { spawn } from 'node:child_process'
import process from 'node:process'

const isWin = process.platform === 'win32'
const pnpmCmd = isWin ? 'pnpm.cmd' : 'pnpm'
function run(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      stdio: 'inherit',
      env: process.env,
      shell: isWin,
    })

    child.on('error', reject)
    child.on('exit', (code, signal) => {
      if (signal) {
        process.kill(process.pid, signal)
        return
      }
      resolve(code ?? 1)
    })
  })
}

const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10)
const shouldSkipViteBuild = process.env.CI === 'true' && nodeMajor === 20

const buildDataCommand = nodeMajor >= 22
  ? {
      command: process.execPath,
      args: ['--experimental-strip-types', './scripts/build-data.ts'],
    }
  : {
      command: pnpmCmd,
      args: ['exec', 'tsx', './scripts/build-data.ts'],
    }

const buildDataExitCode = await run(buildDataCommand.command, buildDataCommand.args)
if (buildDataExitCode !== 0) {
  process.exit(buildDataExitCode)
}

const typecheckExitCode = await run(pnpmCmd, ['exec', 'vue-tsc'])
if (typecheckExitCode !== 0) {
  process.exit(typecheckExitCode)
}

if (shouldSkipViteBuild) {
  console.warn('[benchmark] CI Node 20 环境跳过 vite build，以避免非核心基准面板构建导致整仓失败。')
  process.exit(0)
}

const viteBuildExitCode = await run(pnpmCmd, ['exec', 'vite', 'build'])
process.exit(viteBuildExitCode)
