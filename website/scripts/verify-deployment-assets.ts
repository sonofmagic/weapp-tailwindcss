import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const buildCssDirectory = path.join(projectRoot, 'build/assets/css')
const attempts = 12
const retryDelayMs = 5_000

function digest(content: Uint8Array) {
  return createHash('sha256').update(content).digest('hex')
}

async function getExpectedStylesheets() {
  const filenames = (await readdir(buildCssDirectory))
    .filter(filename => filename.endsWith('.css'))
    .sort()

  if (filenames.length === 0) {
    throw new Error(`未在 ${buildCssDirectory} 找到 CSS 构建产物`)
  }

  return Promise.all(filenames.map(async (filename) => {
    const content = await readFile(path.join(buildCssDirectory, filename))
    return {
      content,
      pathname: `/assets/css/${filename}`,
      sha256: digest(content),
    }
  }))
}

async function verifyOnce(siteUrl: URL, stylesheets: Awaited<ReturnType<typeof getExpectedStylesheets>>) {
  const checkId = Date.now().toString(36)
  const homepageUrl = new URL(siteUrl)
  homepageUrl.searchParams.set('deployment-check', checkId)

  const homepageResponse = await fetch(homepageUrl, {
    headers: {
      'cache-control': 'no-cache',
    },
  })
  if (!homepageResponse.ok) {
    throw new Error(`首页请求失败：${homepageResponse.status} ${homepageResponse.statusText}`)
  }

  const homepage = await homepageResponse.text()
  for (const stylesheet of stylesheets) {
    if (!homepage.includes(`href="${stylesheet.pathname}"`)) {
      throw new Error(`首页未引用本次构建产物：${stylesheet.pathname}`)
    }

    const stylesheetUrl = new URL(stylesheet.pathname, siteUrl)
    const response = await fetch(stylesheetUrl, {
      headers: {
        'cache-control': 'no-cache',
      },
    })
    const contentType = response.headers.get('content-type') ?? ''
    if (!response.ok || !contentType.toLowerCase().startsWith('text/css')) {
      throw new Error(`${stylesheet.pathname} 响应异常：${response.status} ${contentType || 'unknown content-type'}`)
    }

    const content = new Uint8Array(await response.arrayBuffer())
    const remoteSha256 = digest(content)
    if (remoteSha256 !== stylesheet.sha256) {
      throw new Error(`${stylesheet.pathname} 内容不一致：expected ${stylesheet.sha256}, received ${remoteSha256}`)
    }
  }
}

async function main() {
  const rawSiteUrl = process.argv.slice(2).find(argument => argument !== '--')
  if (!rawSiteUrl) {
    throw new Error('请传入待验证的站点 URL')
  }

  const siteUrl = new URL(rawSiteUrl)
  const stylesheets = await getExpectedStylesheets()
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await verifyOnce(siteUrl, stylesheets)
      console.log(`[website] 部署资源验证通过：${siteUrl.origin}`)
      return
    }
    catch (error) {
      lastError = error
      console.warn(`[website] 第 ${attempt}/${attempts} 次部署资源验证失败：${error instanceof Error ? error.message : String(error)}`)
      if (attempt < attempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs))
      }
    }
  }

  throw lastError
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
