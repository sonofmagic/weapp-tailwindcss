import type { Options } from 'npm-registry-fetch'
import { defu } from '@weapp-tailwindcss/shared'

export type FetchOptions = Options
/**
 * @example 'https://registry.npmjs.org'
 * @example 'https://registry.npmmirror.com'
 */
export function fetchPackage(packageName: string, options?: FetchOptions) {
  const opts = defu<FetchOptions, Partial<FetchOptions>[]>(options, {
    // 默认使用国内镜像地址
    registry: 'https://registry.npmmirror.com',
  })
  return import('npm-registry-fetch')
    .then(({ json }) => {
      return json(`/${packageName}`, opts)
    }) as Promise<{
    'dist-tags': {
      latest: string
    }
    'versions': Record<string, unknown>
  }>
}

export async function getLatestVersion(packageName: string, options?: FetchOptions) {
  const response = await fetchPackage(packageName, options)
  return response['dist-tags'].latest
}

export async function getLatestVersionInRange(packageName: string, versionRange: string, options?: FetchOptions) {
  const response = await fetchPackage(packageName, options)
  const versions = Object.keys(response.versions)
  // 过滤出符合指定版本范围的版本
  const filteredVersions = versions.filter(version => version.startsWith(versionRange))
  // 找到符合条件的最新版本
  return filteredVersions.at(-1) ?? response['dist-tags'].latest
}

export type InitMode = 'v4' | 'legacy'

// v5 生成模式只需要 Tailwind CSS 与 weapp-tailwindcss，避免叠加官方生成插件。
export const defaultDevDeps = {
  'tailwindcss': '4',
  'weapp-tailwindcss': '5',
}

export const legacyDevDeps = {
  'tailwindcss': '3',
  'postcss': '8',
  'autoprefixer': '10',
  'weapp-tailwindcss': '4',
}

export async function getDevDepsVersions(options?: FetchOptions, mode: InitMode = 'v4') {
  const deps = mode === 'legacy' ? legacyDevDeps : defaultDevDeps
  return Object.fromEntries(await Promise.all(
    Object.entries(deps).map(
      async (x) => {
        return [x[0], `^${await getLatestVersionInRange(...x, options)}`]
      },
    ),
  )) as typeof defaultDevDeps | typeof legacyDevDeps
}
