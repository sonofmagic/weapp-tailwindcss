import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const attempts = 12
const retryDelayMs = 5_000

function digest(content: Uint8Array) {
  return createHash('sha256').update(content).digest('hex')
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

async function fetchNoCache(url: URL, redirect: RequestRedirect = 'follow') {
  return fetch(url, {
    redirect,
    headers: { 'cache-control': 'no-cache' },
  })
}

async function getExpectedHashedAssets() {
  const cssDirectory = path.join(projectRoot, 'build', 'assets', 'css')
  const cssFiles = (await readdir(cssDirectory)).filter(filename => filename.endsWith('.css')).sort()
  const paths = [
    ...cssFiles.map(filename => `/assets/css/${filename}`),
    '/img/social/weapp-tailwindcss-en.png',
    '/img/social/weapp-tailwindcss-zh-cn.png',
  ]
  return Promise.all(paths.map(async (pathname) => {
    const content = await readFile(path.join(projectRoot, 'build', pathname))
    return { content, pathname, sha256: digest(content) }
  }))
}

async function expectStatus(siteUrl: URL, pathname: string, status: number) {
  const response = await fetchNoCache(new URL(pathname, siteUrl), 'manual')
  assert(response.status === status, `${pathname} expected ${status}, received ${response.status}`)
  return response
}

async function verifyHtmlMetadata(siteUrl: URL, pathname: string, locale: 'en-US' | 'zh-CN') {
  const response = await expectStatus(siteUrl, pathname, 200)
  const html = await response.text()
  const canonicalPath = locale === 'zh-CN' ? pathname : pathname.replace(/^\/en(?=\/|$)/, '')
  assert(html.includes(`rel="canonical" href="${siteUrl.origin}${canonicalPath}`), `${pathname} canonical is missing or incorrect`)
  assert(html.includes('hreflang="en-US"'), `${pathname} is missing en-US hreflang`)
  assert(html.includes('hreflang="zh-CN"'), `${pathname} is missing zh-CN hreflang`)
  assert(html.includes('hreflang="x-default"'), `${pathname} is missing x-default hreflang`)
  assert(html.includes('"@type":"SoftwareSourceCode"'), `${pathname} is missing SoftwareSourceCode JSON-LD`)
  assert(!html.includes('name="geo.region"') && !html.includes('name="ICBM"'), `${pathname} still contains geographic GEO metadata`)
}

async function verifyGeoAssets(siteUrl: URL) {
  const assets = [
    ['/llms-index.json', 'en-US', 'primary'],
    ['/llms-index-full.json', 'en-US', 'full'],
    ['/zh-cn/llms-index.json', 'zh-CN', 'primary'],
    ['/zh-cn/llms-index-full.json', 'zh-CN', 'full'],
  ] as const
  for (const [pathname, locale, tier] of assets) {
    const response = await expectStatus(siteUrl, pathname, 200)
    const payload = await response.json() as { locale?: string, contentTier?: string, documents?: Array<{ canonical?: string }> }
    assert(payload.locale === locale, `${pathname} locale is incorrect`)
    assert(payload.contentTier === tier, `${pathname} content tier is incorrect`)
    assert(Array.isArray(payload.documents) && payload.documents.length > 0, `${pathname} has no documents`)
    if (locale === 'en-US') {
      assert(payload.documents.every(item => !new URL(String(item.canonical)).pathname.startsWith('/en/')), `${pathname} contains /en canonicals`)
    }
  }
}

async function verifyOnce(siteUrl: URL, assets: Awaited<ReturnType<typeof getExpectedHashedAssets>>) {
  await verifyHtmlMetadata(siteUrl, '/', 'en-US')
  await verifyHtmlMetadata(siteUrl, '/docs/intro', 'en-US')
  await verifyHtmlMetadata(siteUrl, '/zh-cn/', 'zh-CN')
  await verifyHtmlMetadata(siteUrl, '/zh-cn/docs/intro', 'zh-CN')

  const englishRedirect = await expectStatus(siteUrl, '/en/docs/intro', 301)
  assert(englishRedirect.headers.get('location') === '/docs/intro', '/en redirect location is incorrect')
  const legacyRedirect = await expectStatus(siteUrl, '/docs/migrations/v2', 301)
  assert(legacyRedirect.headers.get('location') === '/docs/migrations/v5', 'legacy redirect location is incorrect')

  await expectStatus(siteUrl, `/unknown-deployment-${Date.now()}`, 404)
  await expectStatus(siteUrl, `/zh-cn/unknown-deployment-${Date.now()}`, 404)

  const robots = await (await expectStatus(siteUrl, '/robots.txt', 200)).text()
  assert(robots.includes('/sitemap.xml') && robots.includes('/zh-cn/sitemap.xml'), 'robots.txt does not declare both sitemaps')
  await expectStatus(siteUrl, '/sitemap.xml', 200)
  await expectStatus(siteUrl, '/zh-cn/sitemap.xml', 200)
  await verifyGeoAssets(siteUrl)

  const homepage = await (await fetchNoCache(new URL('/', siteUrl))).text()
  for (const asset of assets) {
    if (asset.pathname.startsWith('/assets/css/')) {
      assert(homepage.includes(`href="${asset.pathname}"`), `homepage does not reference ${asset.pathname}`)
    }
    const response = await expectStatus(siteUrl, asset.pathname, 200)
    const remoteSha256 = digest(new Uint8Array(await response.arrayBuffer()))
    assert(remoteSha256 === asset.sha256, `${asset.pathname} does not match this build`)
  }
}

async function main() {
  const rawSiteUrl = process.argv.slice(2).find(argument => argument !== '--')
  if (!rawSiteUrl) {
    throw new Error('请传入待验证的站点 URL')
  }
  const siteUrl = new URL(rawSiteUrl)
  const assets = await getExpectedHashedAssets()
  let lastError: unknown

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await verifyOnce(siteUrl, assets)
      console.log(`[website] Workers 部署验证通过：${siteUrl.origin}`)
      return
    }
    catch (error) {
      lastError = error
      console.warn(`[website] 第 ${attempt}/${attempts} 次验证失败：${error instanceof Error ? error.message : String(error)}`)
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
