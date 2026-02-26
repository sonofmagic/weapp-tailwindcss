import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import yaml from 'js-yaml'

const docExtensions = ['.md', '.mdx']

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export const repoRoot = path.resolve(currentDir, '..')
export const docsRoot = path.join(repoRoot, 'docs')
export const blogRoot = path.join(repoRoot, 'blog')

const sectionKeywordMap = {
  'quick-start': ['快速开始', '安装', '配置'],
  'issues': ['常见问题', '故障排查', '兼容性'],
  'api': ['API', '接口文档', '配置项'],
  'api-v2': ['API', '接口文档', '配置项'],
  'options': ['配置项', '插件参数', '选项'],
  'ai': ['AI 编程', 'LLM', '工作流'],
  'community': ['社区', '模板', '案例'],
  'migrations': ['迁移', '升级', '兼容'],
  'tailwindcss': ['tailwindcss', '教程', '原子化'],
}

const sectionDescriptionMap = {
  'quick-start': '提供安装步骤、配置示例与常见问题排查。',
  'issues': '聚焦兼容性问题、报错现象与修复方案。',
  'api': '包含配置项、接口定义与参数说明。',
  'api-v2': '包含配置项、接口定义与参数说明。',
  'options': '围绕插件选项给出配置建议与使用边界。',
  'ai': '覆盖 AI 工作流、提示词和工程化实践。',
  'community': '汇总生态插件、模板与实践案例。',
  'migrations': '说明版本升级路径、兼容变更与迁移步骤。',
  'tailwindcss': '聚焦 Tailwind CSS 原理、最佳实践与多端经验。',
  'uni-app-x': '提供 uni-app x 场景的接入步骤与注意事项。',
}

const commonKeywords = [
  'weapp-tailwindcss',
  'tailwindcss',
  '小程序',
  '微信小程序',
  'uni-app',
  'taro',
  'rax',
  'mpx',
]

const keywordStopwords = new Set([
  'index',
  'readme',
  'doc',
  'docs',
  'blog',
  'md',
  'mdx',
])

const keywordNoisePatterns = [
  /^\d+(?:\.\d+)*$/,
  /^[_-]+$/,
]

export function walkMarkdownFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return []
  }
  const files = []
  const stack = [rootDir]
  while (stack.length) {
    const current = stack.pop()
    if (!current) {
      continue
    }
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(abs)
        continue
      }
      if (entry.name.startsWith('_')) {
        continue
      }
      if (docExtensions.includes(path.extname(entry.name))) {
        files.push(abs)
      }
    }
  }
  return files.sort()
}

export function extractFirstHeading(content) {
  for (const line of content.split('\n')) {
    if (!line.startsWith('#')) {
      continue
    }
    const heading = line.slice(1).trimStart()
    if (heading) {
      return heading
    }
  }
  return ''
}

function stripMarkdown(content) {
  return content
    .replace(/^import\s.+$/gm, '')
    .replace(/^export\s.+$/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/:::[\s\S]*?:::/g, ' ')
}

export function extractDescription(content, maxLength = 140) {
  const lines = stripMarkdown(content)
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean)

  const candidate = lines.find((line) => {
    if (line.startsWith('#')) {
      return false
    }
    if (line.startsWith('>') || line.startsWith('-') || line.startsWith('*') || line.startsWith('|')) {
      return false
    }
    return line.length >= 12
  }) || ''

  const normalized = candidate.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return ''
  }
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}…`
}

function normalizeKeywordValue(value) {
  if (!value) {
    return []
  }
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean)
  }
  return String(value)
    .split(/[，,、|/]/)
    .map(item => item.trim())
    .filter(Boolean)
}

function isKeywordNoise(value) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) {
    return true
  }
  if (keywordStopwords.has(normalized)) {
    return true
  }
  if (/^[a-z]$/.test(normalized)) {
    return true
  }
  return keywordNoisePatterns.some(pattern => pattern.test(normalized))
}

export function normalizeKeywords(input, options = {}) {
  const maxItems = options.maxItems ?? 16
  const values = normalizeKeywordValue(input)
  const seen = new Set()
  const normalized = []

  for (const rawValue of values) {
    const value = rawValue.trim()
    if (!value || isKeywordNoise(value)) {
      continue
    }
    const key = value.toLowerCase()
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    normalized.push(value)
  }

  return normalized.slice(0, maxItems)
}

function toTitleKeywords(title) {
  return (title.match(/[\p{L}\p{N}#+.-]+/gu) || [])
    .map(item => item.trim())
    .filter(item => item.length >= 2)
}

export function resolveKeywords(params) {
  const relativePath = params.relativePath.replace(/\\/g, '/')
  const firstSection = relativePath.split('/')[0] || ''
  const sectionKeywords = sectionKeywordMap[firstSection] || []
  const pathKeywords = relativePath
    .replace(/\.(md|mdx)$/i, '')
    .split('/')
    .map(item => item.replace(/[-_]/g, ' ').trim())
    .filter(item => item.length >= 2)

  const merged = [
    ...normalizeKeywordValue(params.existingKeywords),
    ...sectionKeywords,
    ...toTitleKeywords(params.title),
    ...pathKeywords,
    ...commonKeywords,
  ]
  return normalizeKeywords(merged, {
    maxItems: params.maxItems ?? 16,
  })
}

export function buildFallbackDescription(title, relativePath) {
  const normalizedTitle = String(title || '文档').trim() || '文档'
  const normalizedPath = String(relativePath || '').replace(/\\/g, '/')
  const firstSection = normalizedPath.split('/')[0] || ''
  const suffix = sectionDescriptionMap[firstSection] || '提供核心概念、配置说明与实践示例。'
  return `${normalizedTitle}，${suffix}`
}

export function toDocRoute(relativePath, slug) {
  if (typeof slug === 'string' && slug.trim()) {
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`
    if (normalizedSlug.startsWith('/docs')) {
      return normalizedSlug
    }
    return `/docs${normalizedSlug}`
  }
  const normalized = relativePath.replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '')
  if (normalized === 'index' || normalized.endsWith('/index')) {
    const withoutIndex = normalized.replace(/\/index$/, '').replace(/^index$/, '')
    return withoutIndex ? `/docs/${withoutIndex}` : '/docs'
  }
  return `/docs/${normalized}`
}

export function toBlogRoute(relativePath, slug) {
  if (typeof slug === 'string' && slug.trim()) {
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`
    if (normalizedSlug.startsWith('/blog')) {
      return normalizedSlug
    }
    return `/blog${normalizedSlug}`
  }
  const normalized = relativePath.replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '')
  const raw = normalized.split('/').pop() || normalized
  const stripped = raw.replace(/^\d{4}-\d{2}-\d{2}-/, '')
  return `/blog/${stripped}`
}

export function readMatterFile(absPath) {
  const raw = fs.readFileSync(absPath, 'utf8')
  const lines = raw.split('\n')
  const firstLine = lines[0]?.trim() || ''
  if (firstLine && !raw.startsWith('---\n') && /^[A-Z_][\w-]*\s*:/i.test(firstLine)) {
    let endIndex = 0
    while (endIndex < lines.length && lines[endIndex].trim() !== '') {
      endIndex += 1
    }
    const yamlBlock = lines.slice(0, endIndex).join('\n')
    try {
      const data = yaml.load(yamlBlock)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const contentStart = endIndex < lines.length ? endIndex + 1 : endIndex
        return {
          raw,
          parsed: {
            data,
            content: lines.slice(contentStart).join('\n'),
          },
        }
      }
    }
    catch {
    }
  }
  return {
    raw,
    parsed: matter(raw),
  }
}

export function writeMatterFile(absPath, parsed, data) {
  const next = matter.stringify(parsed.content, data, {
    lineWidth: 120,
  })
  fs.writeFileSync(absPath, next, 'utf8')
}
