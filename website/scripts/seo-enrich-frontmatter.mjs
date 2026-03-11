import path from 'node:path'
import process from 'node:process'
import {
  blogRoot,
  buildFallbackDescription,
  docsRoot,
  extractDescription,
  extractFirstHeading,
  readMatterFile,
  repoRoot,
  resolveKeywords,
  walkMarkdownFiles,
  writeMatterFile,
} from './seo-shared.mjs'

/** 匹配连字符和下划线（用于文件名转空格） */
const HYPHEN_UNDERSCORE_RE = /[-_]/g

/** 匹配反斜杠 */
const BACKSLASH_RE = /\\/g

/** 匹配路径开头的 website/ 前缀 */
const WEBSITE_PREFIX_RE = /^website\//

/** 匹配路径开头的 docs/ 或 blog/ 前缀 */
const DOCS_BLOG_PREFIX_RE = /^(docs|blog)\//

function createCounters() {
  return {
    scanned: 0,
    changed: 0,
    addTitle: 0,
    addDescription: 0,
    addKeywords: 0,
  }
}

function ensureTitle(data, content, absPath) {
  if (typeof data.title === 'string' && data.title.trim()) {
    return { changed: false, value: data.title }
  }
  const heading = extractFirstHeading(content)
  if (heading) {
    return { changed: true, value: heading }
  }
  const filename = path.basename(absPath, path.extname(absPath))
  return { changed: true, value: filename.replace(HYPHEN_UNDERSCORE_RE, ' ').trim() || '文档' }
}

function ensureDescription(data, content, title, relativePath) {
  if (typeof data.description === 'string' && data.description.trim()) {
    return { changed: false, value: data.description }
  }
  const fromContent = extractDescription(content)
  if (fromContent) {
    return { changed: true, value: fromContent }
  }
  return { changed: true, value: buildFallbackDescription(title, relativePath) }
}

function ensureKeywords(data, title, relativePath) {
  if (Array.isArray(data.keywords) && data.keywords.length > 0) {
    return { changed: false, value: data.keywords }
  }
  if (typeof data.keywords === 'string' && data.keywords.trim()) {
    return { changed: false, value: data.keywords }
  }
  return {
    changed: true,
    value: resolveKeywords({
      existingKeywords: data.keywords,
      relativePath,
      title,
    }),
  }
}

function processFile(absPath, counters, write) {
  counters.scanned += 1
  const { parsed } = readMatterFile(absPath)
  const data = { ...parsed.data }
  const relativePath = path.relative(repoRoot, absPath).replace(BACKSLASH_RE, '/')

  const nextTitle = ensureTitle(data, parsed.content, absPath)
  if (nextTitle.changed) {
    data.title = nextTitle.value
    counters.addTitle += 1
  }

  const relativeContentPath = relativePath.replace(WEBSITE_PREFIX_RE, '').replace(DOCS_BLOG_PREFIX_RE, '')
  const nextDescription = ensureDescription(data, parsed.content, data.title, relativeContentPath)
  if (nextDescription.changed) {
    data.description = nextDescription.value
    counters.addDescription += 1
  }

  const nextKeywords = ensureKeywords(data, data.title, relativeContentPath)
  if (nextKeywords.changed) {
    data.keywords = nextKeywords.value
    counters.addKeywords += 1
  }

  if (!nextTitle.changed && !nextDescription.changed && !nextKeywords.changed) {
    return
  }

  counters.changed += 1
  if (write) {
    writeMatterFile(absPath, parsed, data)
  }
}

const write = process.argv.includes('--write')
const docsCounters = createCounters()
const blogCounters = createCounters()

for (const file of walkMarkdownFiles(docsRoot)) {
  processFile(file, docsCounters, write)
}

for (const file of walkMarkdownFiles(blogRoot)) {
  processFile(file, blogCounters, write)
}

const total = {
  scanned: docsCounters.scanned + blogCounters.scanned,
  changed: docsCounters.changed + blogCounters.changed,
  addTitle: docsCounters.addTitle + blogCounters.addTitle,
  addDescription: docsCounters.addDescription + blogCounters.addDescription,
  addKeywords: docsCounters.addKeywords + blogCounters.addKeywords,
}

console.table([
  { scope: 'docs', ...docsCounters },
  { scope: 'blog', ...blogCounters },
  { scope: 'all', ...total },
])

if (!write) {
  console.log('当前为预览模式，添加 --write 才会写入文件。')
}
