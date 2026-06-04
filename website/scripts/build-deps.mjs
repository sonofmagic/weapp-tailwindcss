import { spawn } from 'node:child_process'
import process from 'node:process'

if (process.env.TURBO_HASH) {
  process.stdout.write('[website] Skip build:deps inside turbo task.\n')
}
else {
  const child = spawn('pnpm', [
    '--filter',
    '@weapp-tailwindcss/website...',
    '--filter',
    '!@weapp-tailwindcss/website',
    'build',
  ], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  const exitCode = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('exit', resolve)
  })
  if (exitCode !== 0) {
    process.exit(typeof exitCode === 'number' ? exitCode : 1)
  }
}
