import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '..')
const lynxPackage = '@weapp-tailwindcss/lynx'
const examplePackage = '@weapp-tailwindcss/example-react-lynx'
const bundlePath = path.resolve(repoRoot, 'examples/react-lynx/dist/main.lynx.bundle')

async function runPnpm(args: string[]) {
  await execa('pnpm', args, {
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
    timeout: 300_000,
  })
}

describe('ReactLynx Rspeedy integration', () => {
  it('builds the public Lynx package before consuming its workspace export', async () => {
    await runPnpm(['--filter', lynxPackage, 'build'])
  }, 300_000)

  it('builds a real Lynx bundle with Tailwind className values', async () => {
    await runPnpm(['--filter', examplePackage, 'build'])

    const bundle = await fs.readFile(bundlePath)
    const bundleText = bundle.toString('latin1')
    expect(bundle.byteLength).toBeGreaterThan(1024)
    expect(bundleText).toContain('flex items-center justify-center bg-sky-500 p-6')
    expect(bundleText).toContain('text-lg font-bold text-white')
    expect(bundleText).toContain('weapp-tailwindcss + Lynx')
    expect(bundleText).not.toContain('@import "tailwindcss"')
  }, 300_000)
})
