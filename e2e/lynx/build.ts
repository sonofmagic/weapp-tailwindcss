import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { exampleDir, repoRoot } from './catalog'

const artifactsDir = path.join(repoRoot, 'e2e', '.artifacts', 'lynx-static')

async function runPnpm(args: string[], logPath: string) {
  const result = await execa('pnpm', args, {
    all: true,
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    reject: false,
    timeout: 300_000,
  })
  const output = result.all ?? ''
  await fs.writeFile(logPath, output)
  if (result.exitCode !== 0) {
    throw new Error(output || `pnpm ${args.join(' ')} failed with exit code ${result.exitCode}`)
  }
  return output
}

export async function buildCompatibilityBundle() {
  await fs.mkdir(artifactsDir, { recursive: true })
  await runPnpm(
    ['--filter', 'weapp-tailwindcss...', '--filter', '@weapp-tailwindcss/lynx', 'build'],
    path.join(artifactsDir, 'package-build.log'),
  )
  const encoderLog = await runPnpm(
    ['--filter', '@weapp-tailwindcss/example-react-lynx', 'exec', 'rspeedy', 'build', '--mode', 'development'],
    path.join(artifactsDir, 'encoder.log'),
  )
  await Promise.all([
    fs.copyFile(path.join(exampleDir, 'dist', '.rspeedy', 'main', 'main.css'), path.join(artifactsDir, 'main.css')),
    fs.copyFile(path.join(exampleDir, 'dist', '.rspeedy', 'main', 'tasm.json'), path.join(artifactsDir, 'tasm.json')),
    fs.copyFile(path.join(exampleDir, 'dist', 'main.lynx.bundle'), path.join(artifactsDir, 'main.lynx.bundle')),
  ])
  return { encoderLog, artifactsDir }
}
