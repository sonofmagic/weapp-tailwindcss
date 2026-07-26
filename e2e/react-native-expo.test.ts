import fs from 'node:fs/promises'
import os from 'node:os'
import process from 'node:process'
import { execa } from 'execa'
import path from 'pathe'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '..')
const examplePackage = '@weapp-tailwindcss/example-react-native-expo'
const nativePackage = '@weapp-tailwindcss/react-native'

interface ExpoExportMetadata {
  bundler: string
  fileMetadata: Record<string, { bundle?: string }>
}

async function buildNativePackage() {
  await execa('pnpm', ['--filter', nativePackage, 'build'], {
    cwd: repoRoot,
    env: { ...process.env, CI: '1' },
    stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
  })
}

async function exportExample(platform: 'android' | 'ios') {
  const outputRoot = await fs.mkdtemp(path.join(os.tmpdir(), `weapp-tailwindcss-rn-expo-${platform}-`))
  try {
    await execa('pnpm', [
      '--filter',
      examplePackage,
      'exec',
      'expo',
      'export',
      '--platform',
      platform,
      '--output-dir',
      outputRoot,
    ], {
      cwd: repoRoot,
      env: { ...process.env, CI: '1' },
      stdio: process.env['E2E_DEBUG_BUILD'] === '1' ? 'inherit' : 'pipe',
      timeout: 300_000,
    })

    const metadata = JSON.parse(await fs.readFile(path.resolve(outputRoot, 'metadata.json'), 'utf8')) as ExpoExportMetadata
    const bundleName = metadata.fileMetadata[platform]?.bundle
    expect(metadata.bundler).toBe('metro')
    expect(bundleName, `${platform} export should report a bundle`).toBeTruthy()
    const bundlePath = path.resolve(outputRoot, bundleName!)
    const bundle = await fs.readFile(bundlePath)
    const bundleText = bundle.toString('latin1')

    expect(bundleText).toContain('backgroundColor')
    expect(bundleText).toContain('colorScheme')
    expect(bundleText).toContain('dark:bg-slate-900')
    expect(bundleText).toContain('ios:px-4')
    expect(bundleText).toContain('android:px-2')
    expect(bundleText).toContain('Tailwind RN')
  }
  finally {
    await fs.rm(outputRoot, { recursive: true, force: true })
  }
}

describe('React Native Expo Metro export', () => {
  it('builds the native package before consuming its workspace export', async () => {
    await buildNativePackage()
  }, 300_000)

  it.each(['ios', 'android'] as const)('exports a real %s Metro bundle with native Tailwind rules', async (platform) => {
    await exportExample(platform)
  }, 300_000)
})
