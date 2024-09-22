import { getDevDepsVersions, getLatestVersion, getLatestVersionInRange } from '@/npm'

describe('getLatestVersion', () => {
  it.skip('tailwindcss', async () => {
    let version = await getLatestVersion('tailwindcss')
    expect(version).toBe('3.4.12')
    version = await getLatestVersionInRange('tailwindcss', '3')
    expect(version).toBe('3.4.12')
    version = await getLatestVersionInRange('tailwindcss', '2')
    expect(version).toBe('2.2.19')
    // const version2 = await getLatestVersion2('tailwindcss')
    // expect(version2).toBe('3.4.12')
  })

  it('getDevDepsVersions', async () => {
    const res = await getDevDepsVersions()
    console.log(res)
  })
})
