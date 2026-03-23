#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const webpackCacheDir = path.resolve(__dirname, '../node_modules/.cache/webpack')
const INDEX_PACK_FILES = new Set(['index.pack', 'index.pack.old'])

/** 匹配正则表达式中需要转义的特殊字符 */
const REGEXP_SPECIAL_CHARS = /[.*+?^${}()|[\]\\]/g

function escapeRegExp(value) {
  return value.replace(REGEXP_SPECIAL_CHARS, '\\$&')
}

function listIndexPackFiles(dir) {
  if (!existsSync(dir)) {
    return []
  }
  const result = []
  const stack = [dir]
  while (stack.length) {
    const current = stack.pop()
    const entries = readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      }
      else if (entry.isFile() && INDEX_PACK_FILES.has(entry.name)) {
        result.push(fullPath)
      }
    }
  }
  return result
}

/** 匹配 loader 查询分隔符（!、?、|） */
const QUERY_SEPARATOR_RE = /[!?|]/

/** 匹配路径末尾的多余标点符号 */
const TRAILING_PUNCTUATION_RE = /[,'"`;]+$/g

function sanitizeCandidatePath(rawPath) {
  const querySplit = rawPath.split(QUERY_SEPARATOR_RE, 1)[0]
  return querySplit.replace(TRAILING_PUNCTUATION_RE, '')
}

function findStalePnpmPath(cacheFile) {
  const content = readFileSync(cacheFile, 'latin1').replaceAll('\\', '/')
  const escapedRoot = escapeRegExp(projectRoot.replaceAll('\\', '/'))
  const markerPattern = new RegExp(
    `${escapedRoot}/node_modules/\\.pnpm/[\\x21-\\x7E]+?(?=[\\x00-\\x20]|$)`,
    'g',
  )

  let match = markerPattern.exec(content)
  while (match) {
    const candidatePath = sanitizeCandidatePath(match[0])
    if (candidatePath.includes('/node_modules/.pnpm/') && !existsSync(candidatePath)) {
      return candidatePath
    }
    match = markerPattern.exec(content)
  }
  return null
}

function getStaleCacheInfo() {
  const cacheFiles = listIndexPackFiles(webpackCacheDir)
  for (const cacheFile of cacheFiles) {
    const stalePath = findStalePnpmPath(cacheFile)
    if (stalePath) {
      return { cacheFile, stalePath }
    }
  }
  return null
}

if (existsSync(webpackCacheDir)) {
  const staleCacheInfo = getStaleCacheInfo()
  if (staleCacheInfo) {
    rmSync(webpackCacheDir, { recursive: true, force: true })
    const relativeCacheFile = path.relative(projectRoot, staleCacheInfo.cacheFile)
    console.log(`[website] cleared webpack cache due to stale marker in ${relativeCacheFile}`)
  }
}
