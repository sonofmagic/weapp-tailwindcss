import { getDevDepsVersions, getLatestVersion, getLatestVersionInRange } from '@/npm'
import CI from 'ci-info'
import { fetchOptions } from './util'

describe.skipIf(CI.isCI)('getLatestVersion', () => {
  it.skip('tailwindcss', async () => {
    let version = await getLatestVersion('tailwindcss', fetchOptions)
    expect(version).toBe('3.4.13')
    version = await getLatestVersionInRange('tailwindcss', '3', fetchOptions)
    expect(version).toBe('3.4.13')
    version = await getLatestVersionInRange('tailwindcss', '2', fetchOptions)
    expect(version).toBe('2.2.19')
    // const version2 = await getLatestVersion2('tailwindcss')
    // expect(version2).toBe('3.4.12')
  })

  it('getDevDepsVersions', async () => {
    const res = await getDevDepsVersions(fetchOptions)
    console.log(res)
  })

  it('tailwindcss@2', async () => {
    const version = await getLatestVersionInRange('tailwindcss', '2', fetchOptions)
    expect(version.startsWith('2.')).toBe(true)// .toBe('2.2.19')
  })

  it('tailwindcss@3', async () => {
    const version = await getLatestVersionInRange('tailwindcss', '3', fetchOptions)
    expect(version).toBe('3.4.13')
  })

  it('tailwindcss@latest', async () => {
    const version = await getLatestVersion('tailwindcss', fetchOptions)
    expect(version).toBe('3.4.13')
  })
})
