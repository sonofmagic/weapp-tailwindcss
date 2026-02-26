import fs from 'node:fs'
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

const siteUrl = process.env.SITE_URL || 'https://tw.icebreaker.top'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const websiteRoot = path.resolve(currentDir, '..')
const staticRoot = path.join(websiteRoot, 'static')
const outputFile = path.join(staticRoot, 'llms-index.json')

function resolveTitle(data, content, absPath) {
  if (typeof data.title === 'string' && data.title.trim()) {
    return data.title
  }
  const heading = extractFirstHeading(content)
  if (heading) {
    return heading
  }
  return path.basename(absPath, path.extname(absPath)).replace(/[-_]/g, ' ').trim() || '文档'
}

function resolveDescription(data, content, title, relativePath) {
  if (typeof data.description === 'string' && data.description.trim()) {
    return data.description.trim()
  }
  return extractDescription(content) || buildFallbackDescription(title, relativePath)
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
  return `${siteUrl.replace(/\/$/, '')}${normalized}`
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

function buildDocRecords() {
  const docsFiles = walkMarkdownFiles(docsRoot)
  return docsFiles.map((absPath) => {
    const relative = path.relative(docsRoot, absPath).replace(/\\/g, '/')
    const { parsed } = readMatterFile(absPath)
    const title = resolveTitle(parsed.data, parsed.content, absPath)
    const routePath = toDocRoute(relative, parsed.data.slug)
    const canonical = toCanonical(routePath)
    const description = resolveDescription(parsed.data, parsed.content, title, relative)
    return {
      kind: 'doc',
      id: `doc:${relative.replace(/\.(md|mdx)$/i, '')}`,
      title,
      description,
      summary: extractDescription(parsed.content, 180) || description,
      url: routePath,
      canonical,
      keywords: resolveKeywords({
        existingKeywords: parsed.data.keywords,
        title,
        relativePath: relative,
      }),
      headings: resolveHeadings(parsed.content),
      updatedAt: toDate(parsed.data),
      source: `docs/${relative}`,
    }
  })
}

function buildBlogRecords() {
  const blogFiles = walkMarkdownFiles(blogRoot)
  return blogFiles.map((absPath) => {
    const relative = path.relative(blogRoot, absPath).replace(/\\/g, '/')
    const { parsed } = readMatterFile(absPath)
    const title = resolveTitle(parsed.data, parsed.content, absPath)
    const routePath = toBlogRoute(relative, parsed.data.slug)
    const canonical = toCanonical(routePath)
    const description = resolveDescription(parsed.data, parsed.content, title, relative)
    return {
      kind: 'blog',
      id: `blog:${relative.replace(/\.(md|mdx)$/i, '')}`,
      title,
      description,
      summary: extractDescription(parsed.content, 180) || description,
      url: routePath,
      canonical,
      keywords: resolveKeywords({
        existingKeywords: parsed.data.keywords,
        title,
        relativePath: relative,
      }),
      headings: resolveHeadings(parsed.content),
      updatedAt: toDate(parsed.data),
      source: `blog/${relative}`,
    }
  })
}

function main() {
  const docs = buildDocRecords()
  const blogs = buildBlogRecords()
  const documents = [...docs, ...blogs].sort((a, b) => a.url.localeCompare(b.url))
  const payload = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    siteUrl,
    totals: {
      all: documents.length,
      docs: docs.length,
      blog: blogs.length,
    },
    documents,
  }

  fs.mkdirSync(staticRoot, { recursive: true })
  fs.writeFileSync(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  console.log(`GEO 索引已生成: ${path.relative(websiteRoot, outputFile)} (docs=${docs.length}, blog=${blogs.length})`)
}

main()
