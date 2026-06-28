import { describe, expect, it } from 'vitest'
import path from 'node:path'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import {
  DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION,
  normalizeSupportedTailwindcssMajorVersion,
  readInstalledPackageMajorVersion,
} from '@/tailwindcss/version'

const repoRoot = path.resolve(__dirname, '../../../..')

describe('tailwindcss version helpers', () => {
  it('normalizes only supported Tailwind major versions', () => {
    expect(normalizeSupportedTailwindcssMajorVersion(4)).toBe(4)
    expect(normalizeSupportedTailwindcssMajorVersion(3)).toBeUndefined()
    expect(normalizeSupportedTailwindcssMajorVersion(2)).toBeUndefined()
    expect(normalizeSupportedTailwindcssMajorVersion(undefined)).toBeUndefined()
  })

  it('keeps normalizeSupportedTailwindcssMajorVersion strict on non-4 values', () => {
    expect(normalizeSupportedTailwindcssMajorVersion(0)).toBeUndefined()
    expect(normalizeSupportedTailwindcssMajorVersion(5)).toBeUndefined()
  })

  it('defines Tailwind v4 as the default generator major version', () => {
    expect(DEFAULT_TAILWINDCSS_GENERATOR_MAJOR_VERSION).toBe(4)
  })

  it('reads the installed Tailwind package major version from the project root', () => {
    expect(readInstalledPackageMajorVersion('tailwindcss', repoRoot)).toBe(4)
    expect(readInstalledPackageMajorVersion('tailwindcss4', repoRoot)).toBe(4)
  })

  it('returns undefined when the Tailwind package is not installed', () => {
    expect(readInstalledPackageMajorVersion('__missing_tailwindcss__', process.cwd())).toBeUndefined()
  })

  it('returns undefined when the declared version cannot be parsed as v4', () => {
    expect(readInstalledPackageMajorVersion('not-a-real-package', path.resolve(__dirname, '..'))).toBeUndefined()
  })

  it('falls back to declared package versions when installed package metadata is unavailable', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-version-'))
    await writeFile(path.join(root, 'package.json'), JSON.stringify({
      dependencies: {
        tailwindcss: '^4.3.0',
      },
    }))

    expect(readInstalledPackageMajorVersion('tailwindcss', root)).toBe(4)
  })

  it('ignores unreadable package.json declarations while walking package roots', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'weapp-tw-version-invalid-'))
    const nested = path.join(root, 'packages/app')
    await mkdir(nested, { recursive: true })
    await writeFile(path.join(root, 'package.json'), '{')

    expect(readInstalledPackageMajorVersion('tailwindcss', nested)).toBeUndefined()
  })
})
