import process from 'node:process'
import { pathToFileURL } from 'node:url'

export const npmMirrorRegistry = 'https://registry-direct.npmmirror.com'

function packagePath(name) {
  if (!/^(?:@[^/\s]+\/)?[^/\s]+$/u.test(name)) {
    throw new Error(`非法 npm 包名：${name}`)
  }

  return name.split('/').map(segment => encodeURIComponent(segment)).join('/')
}

export function parsePublishedPackages(value) {
  if (!value?.trim()) {
    return []
  }

  let packages
  try {
    packages = JSON.parse(value)
  }
  catch (error) {
    throw new Error(`无法解析 Changesets 发布包列表：${error instanceof Error ? error.message : String(error)}`)
  }

  if (!Array.isArray(packages)) {
    throw new TypeError('Changesets 发布包列表必须是数组')
  }

  const names = packages.map((item) => {
    const name = typeof item === 'string' ? item : item?.name
    if (typeof name !== 'string' || !name) {
      throw new Error('Changesets 发布包列表包含缺少 name 的条目')
    }
    return name
  })

  return [...new Set(names)]
}

export async function syncPackages(packageNames, options = {}) {
  const registry = options.registry ?? npmMirrorRegistry
  const fetchImpl = options.fetchImpl ?? fetch

  for (const name of packageNames) {
    const endpoint = `${registry}/-/package/${packagePath(name)}/syncs`
    const response = await fetchImpl(endpoint, { method: 'PUT' })
    const body = await response.text()
    let result
    try {
      result = JSON.parse(body)
    }
    catch {
      result = undefined
    }

    if (!response.ok || result?.ok !== true) {
      throw new Error(`npmmirror 同步请求失败：${name} (${response.status})${body ? ` ${body}` : ''}`)
    }

    console.log(`已为 ${name} 创建 npmmirror 同步任务${result.id ? `：${result.id}` : ''}`)
  }
}

async function main() {
  const packageNames = parsePublishedPackages(process.env.PUBLISHED_PACKAGES)
  if (!packageNames.length) {
    console.log('本次没有发布 npm 包，跳过 npmmirror 同步')
    return
  }

  await syncPackages(packageNames)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
