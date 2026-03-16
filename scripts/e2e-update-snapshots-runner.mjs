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

const command = nodeMajor >= 22
  ? {
      bin: process.execPath,
      args: ['--experimental-strip-types', 'scripts/update-e2e-css-snapshots.ts'],
    }
  : {
      bin: pnpmCmd,
      args: ['exec', 'tsx', 'scripts/update-e2e-css-snapshots.ts'],
    }

const exitCode = await run(command.bin, command.args)
process.exit(exitCode)
