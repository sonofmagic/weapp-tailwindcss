import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import {
  blogRoot,
  buildFallbackDescription,
  docsRoot,
  extractDescription,
  extractFirstHeading,
  readMatterFile,
  resolveKeywords,
  toBlogRoute,
  toDocRoute,
  walkMarkdownFiles,
} from './seo-shared.mjs'
import { writeStableJson } from './write-stable-json.mjs'

const siteUrl = process.env.SITE_URL || 'https://tw.icebreaker.top'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const websiteRoot = path.resolve(currentDir, '..')
const staticRoot = path.join(websiteRoot, 'static')
const outputFile = path.join(staticRoot, 'llms-index.json')
const englishOutputFile = path.join(staticRoot, 'en', 'llms-index.json')
const englishDocsRoot = path.join(websiteRoot, 'i18n', 'en', 'docusaurus-plugin-content-docs', 'current')
const englishBlogRoot = path.join(websiteRoot, 'i18n', 'en', 'docusaurus-plugin-content-blog')
const englishCommonKeywords = ['weapp-tailwindcss', 'tailwindcss', 'mini app', 'mini program', 'uni-app', 'taro', 'mpx']
const englishSectionKeywordMap = {
  'quick-start': ['quick start', 'installation', 'configuration'],
}

/** 匹配连字符和下划线（用于文件名转空格） */
const HYPHEN_UNDERSCORE_RE = /[-_]/g

/** 匹配 .md 或 .mdx 文件扩展名（不区分大小写） */
const MD_MDX_EXTENSION_RE = /\.(md|mdx)$/i

/** 匹配反斜杠 */
const BACKSLASH_RE = /\\/g

/** 匹配 URL 末尾的斜杠 */
const TRAILING_SLASH_RE = /\/$/

function resolveTitle(data, content, absPath, fallbackTitle = '文档') {
  if (typeof data.title === 'string' && data.title.trim()) {
    return data.title
  }
  const heading = extractFirstHeading(content)
  if (heading) {
    return heading
  }
  return path.basename(absPath, path.extname(absPath)).replace(HYPHEN_UNDERSCORE_RE, ' ').trim() || fallbackTitle
}

function resolveDescription(data, content, title, relativePath, language = 'zh-cn') {
  if (typeof data.description === 'string' && data.description.trim()) {
    return data.description.trim()
  }
  return extractDescription(content)
    || (language === 'en'
      ? `${title} documentation for weapp-tailwindcss.`
      : buildFallbackDescription(title, relativePath))
}

function resolveHeadings(content) {
  const headings = []
  for (const line of content.split('\n')) {
    if (!line.startsWith('##')) {
      continue
    }
    const heading = line.slice(2).trimStart()
    if (heading) {
      headings.push(heading)
    }
    if (headings.length >= 8) {
      break
    }
  }
  return headings
}

function toCanonical(routePath) {
  const normalized = routePath.startsWith('/') ? routePath : `/${routePath}`
  return `${siteUrl.replace(TRAILING_SLASH_RE, '')}${normalized}`
}

function toDate(data) {
  const candidate = data.last_updated_at || data.lastUpdatedAt || data.date
  if (!candidate) {
    return null
  }
  const date = new Date(candidate)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toISOString()
}

function withLocalePrefix(routePath, localePrefix) {
  return localePrefix ? `${localePrefix}${routePath}` : routePath
}

function buildDocRecords({ contentRoot = docsRoot, language = 'zh-cn', localePrefix = '', sourcePrefix = 'docs' } = {}) {
  const docsFiles = walkMarkdownFiles(contentRoot)
  return docsFiles.map((absPath) => {
    const relative = path.relative(contentRoot, absPath).replace(BACKSLASH_RE, '/')
    const { parsed } = readMatterFile(absPath)
    const title = resolveTitle(parsed.data, parsed.content, absPath, language === 'en' ? 'Document' : '文档')
    const routePath = withLocalePrefix(toDocRoute(relative, parsed.data.slug), localePrefix)
    const canonical = toCanonical(routePath)
    const description = resolveDescription(parsed.data, parsed.content, title, relative, language)
    return {
      kind: 'doc',
      id: `doc:${relative.replace(MD_MDX_EXTENSION_RE, '')}`,
      title,
      description,
      summary: extractDescription(parsed.content, 180) || description,
      url: routePath,
      canonical,
      keywords: resolveKeywords({
        commonKeywords: language === 'en' ? englishCommonKeywords : undefined,
        existingKeywords: parsed.data.keywords,
        sectionKeywordMap: language === 'en' ? englishSectionKeywordMap : undefined,
        title,
        relativePath: relative,
      }),
      headings: resolveHeadings(parsed.content),
      updatedAt: toDate(parsed.data),
      source: `${sourcePrefix}/${relative}`,
    }
  })
}

function buildBlogRecords({ contentRoot = blogRoot, language = 'zh-cn', localePrefix = '', sourcePrefix = 'blog' } = {}) {
  const blogFiles = walkMarkdownFiles(contentRoot)
  return blogFiles.map((absPath) => {
    const relative = path.relative(contentRoot, absPath).replace(BACKSLASH_RE, '/')
    const { parsed } = readMatterFile(absPath)
    const title = resolveTitle(parsed.data, parsed.content, absPath, language === 'en' ? 'Post' : '文档')
    const blogRoute = language === 'en' && !parsed.data.slug
      ? `/blog/${relative.replace(MD_MDX_EXTENSION_RE, '')}`
      : toBlogRoute(relative, parsed.data.slug)
    const routePath = withLocalePrefix(blogRoute, localePrefix)
    const canonical = toCanonical(routePath)
    const description = resolveDescription(parsed.data, parsed.content, title, relative, language)
    return {
      kind: 'blog',
      id: `blog:${relative.replace(MD_MDX_EXTENSION_RE, '')}`,
      title,
      description,
      summary: extractDescription(parsed.content, 180) || description,
      url: routePath,
      canonical,
      keywords: resolveKeywords({
        commonKeywords: language === 'en' ? englishCommonKeywords : undefined,
        existingKeywords: parsed.data.keywords,
        sectionKeywordMap: language === 'en' ? englishSectionKeywordMap : undefined,
        title,
        relativePath: relative,
      }),
      headings: resolveHeadings(parsed.content),
      updatedAt: toDate(parsed.data),
      source: `${sourcePrefix}/${relative}`,
    }
  })
}

function createPayload({ blogs, docs, now, payloadSiteUrl }) {
  const documents = [...docs, ...blogs].sort((a, b) => a.url.localeCompare(b.url))
  return {
    version: '1.0.0',
    generatedAt: now,
    siteUrl: payloadSiteUrl,
    totals: {
      all: documents.length,
      docs: docs.length,
      blog: blogs.length,
    },
    documents,
  }
}

export function createGeoIndexPayload(now = new Date().toISOString()) {
  return createPayload({
    blogs: buildBlogRecords(),
    docs: buildDocRecords(),
    now,
    payloadSiteUrl: siteUrl,
  })
}

export function createEnglishGeoIndexPayload(now = new Date().toISOString()) {
  return createPayload({
    blogs: buildBlogRecords({
      contentRoot: englishBlogRoot,
      language: 'en',
      localePrefix: '/en',
      sourcePrefix: 'i18n/en/blog',
    }),
    docs: buildDocRecords({
      contentRoot: englishDocsRoot,
      language: 'en',
      localePrefix: '/en',
      sourcePrefix: 'i18n/en/docs',
    }),
    now,
    payloadSiteUrl: `${siteUrl.replace(TRAILING_SLASH_RE, '')}/en`,
  })
}

export function writeGeoIndex(now = new Date().toISOString()) {
  const payload = createGeoIndexPayload(now)
  const englishPayload = createEnglishGeoIndexPayload(now)
  const changed = writeStableJson(outputFile, payload)
  const englishChanged = writeStableJson(englishOutputFile, englishPayload)
  return { changed, englishChanged, englishPayload, payload }
}

function main() {
  const { changed, englishChanged, englishPayload, payload } = writeGeoIndex()
  const suffix = changed ? '' : '（内容未变化，跳过写入）'
  const englishSuffix = englishChanged ? '' : ' (unchanged)'
  console.log(`GEO 索引已生成: ${path.relative(websiteRoot, outputFile)} (docs=${payload.totals.docs}, blog=${payload.totals.blog})${suffix}`)
  console.log(`English GEO index generated: ${path.relative(websiteRoot, englishOutputFile)} (docs=${englishPayload.totals.docs}, blog=${englishPayload.totals.blog})${englishSuffix}`)
}

main()
