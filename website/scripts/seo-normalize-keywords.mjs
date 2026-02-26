import process from 'node:process'
import {
  blogRoot,
  docsRoot,
  normalizeKeywords,
  readMatterFile,
  resolveKeywords,
  walkMarkdownFiles,
  writeMatterFile,
} from './seo-shared.mjs'

function parseArgs(argv) {
  const options = {
    write: false,
    maxItems: 16,
  }
  for (const arg of argv) {
    if (arg === '--write') {
      options.write = true
      continue
    }
    if (arg.startsWith('--max-items=')) {
      options.maxItems = Number(arg.slice('--max-items='.length)) || options.maxItems
    }
  }
  return options
}

function normalizeFile(filePath, rootDir, options) {
  const { parsed } = readMatterFile(filePath)
  const data = { ...parsed.data }
  const relativePath = filePath.replace(`${rootDir}/`, '').replace(/\\/g, '/')

  const existing = data.keywords
  const normalized = normalizeKeywords(existing, {
    maxItems: options.maxItems,
  })
  const fallback = resolveKeywords({
    existingKeywords: existing,
    title: data.title || relativePath,
    relativePath,
    maxItems: options.maxItems,
  })
  const nextKeywords = normalized.length > 0 ? normalized : fallback

  const same
    = Array.isArray(existing)
      && existing.length === nextKeywords.length
      && existing.every((item, index) => String(item).trim() === nextKeywords[index])

  if (same) {
    return {
      changed: false,
      hadKeywords: Array.isArray(existing) ? existing.length > 0 : Boolean(existing),
    }
  }

  data.keywords = nextKeywords

  if (options.write) {
    writeMatterFile(filePath, parsed, data)
  }

  return {
    changed: true,
    hadKeywords: Array.isArray(existing) ? existing.length > 0 : Boolean(existing),
  }
}

function runOnRoot(rootDir, label, options) {
  const files = walkMarkdownFiles(rootDir)
  const counters = {
    scope: label,
    scanned: 0,
    changed: 0,
    withKeywords: 0,
    regenerated: 0,
  }

  for (const filePath of files) {
    counters.scanned += 1
    const result = normalizeFile(filePath, rootDir, options)
    if (result.hadKeywords) {
      counters.withKeywords += 1
    }
    if (result.changed) {
      counters.changed += 1
      if (!result.hadKeywords) {
        counters.regenerated += 1
      }
    }
  }

  return counters
}

const options = parseArgs(process.argv.slice(2))
const docs = runOnRoot(docsRoot, 'docs', options)
const blog = runOnRoot(blogRoot, 'blog', options)
const all = {
  scope: 'all',
  scanned: docs.scanned + blog.scanned,
  changed: docs.changed + blog.changed,
  withKeywords: docs.withKeywords + blog.withKeywords,
  regenerated: docs.regenerated + blog.regenerated,
}

console.table([docs, blog, all])

if (!options.write) {
  console.log('当前为预览模式，添加 --write 才会写入文件。')
}
