import { describe, expect, it } from 'vitest'
import path from 'node:path'
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
})
