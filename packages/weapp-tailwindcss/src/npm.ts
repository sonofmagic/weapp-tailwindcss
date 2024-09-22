import fetch from 'npm-registry-fetch'

export function fetchPackage(packageName: string) {
  return fetch.json(`/${packageName}`) as Promise<{
    'dist-tags': {
      latest: string
    }
    'versions': Record<string, unknown>
  }>
}

export async function getLatestVersion(packageName: string) {
  const response = await fetchPackage(packageName)
  return response['dist-tags'].latest
}

export async function getLatestVersionInRange(packageName: string, versionRange: string) {
  const response = await fetchPackage(packageName)
  const versions = Object.keys(response.versions)
  // 过滤出符合指定版本范围的版本
  const filteredVersions = versions.filter(version => version.startsWith(versionRange))
  // 找到符合条件的最新版本
  return filteredVersions[filteredVersions.length - 1]
}

// tailwindcss postcss autoprefixer weapp-tailwindcss
export const defaultDevDeps = {
  'tailwindcss': '3',
  'postcss': '8',
  'autoprefixer': '10',
  'weapp-tailwindcss': '3',
}

export async function getDevDepsVersions() {
  return Object.fromEntries(await Promise.all(
    Object.entries(defaultDevDeps).map(
      async (x) => {
        return [x[0], `^${await getLatestVersionInRange(...x)}`]
      },
    ),
  )) as typeof defaultDevDeps
}
