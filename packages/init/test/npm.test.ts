import { getDevDepsVersions, getLatestVersion, getLatestVersionInRange } from '@/npm'
import { describe, expect, it } from 'vitest'
import { fetchOptions } from './util'

describe('getLatestVersion', () => {
  it('resolves latest versions without touching the network', async () => {
    let version = await getLatestVersion('tailwindcss', fetchOptions)
    expect(version).toBe('4.2.4')
    version = await getLatestVersionInRange('tailwindcss', '3', fetchOptions)
    expect(version).toBe('3.4.19')
    version = await getLatestVersionInRange('tailwindcss', '2', fetchOptions)
    expect(version).toBe('2.2.19')
  })

  it('getDevDepsVersions', async () => {
    const res = await getDevDepsVersions(fetchOptions)
    for (const [packageName, majorVersion] of Object.entries({
      tailwindcss: '3',
      postcss: '8',
      autoprefixer: '10',
      'weapp-tailwindcss': '3',
    })) {
      expect(res[packageName as keyof typeof res].startsWith(`^${majorVersion}.`)).toBe(true)
    }
  })

  it('tailwindcss@2', async () => {
    const version = await getLatestVersionInRange('tailwindcss', '2', fetchOptions)
    expect(version.startsWith('2.')).toBe(true)// .toBe('2.2.19')
  })

  it('tailwindcss@3', async () => {
    const version = await getLatestVersionInRange('tailwindcss', '3', fetchOptions)
    expect(version?.startsWith('3.')).toBe(true)
  })

  it('tailwindcss@latest', async () => {
    const version = await getLatestVersion('tailwindcss', fetchOptions)
    expect(version).toMatch(/^\d+\.\d+\.\d+/u)
  })
})
