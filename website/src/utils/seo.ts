const baseKeywords = [
  'weapp-tailwindcss',
  'tailwindcss',
  '小程序',
  '微信小程序',
  'uni-app',
  'taro',
  'rax',
  'mpx',
]

const sectionKeywords: Array<{ pattern: RegExp, keywords: string[] }> = [
  {
    pattern: /\/docs\/quick-start(\/|$)/,
    keywords: ['快速开始', '安装', '配置'],
  },
  {
    pattern: /\/docs\/issues(\/|$)/,
    keywords: ['常见问题', '故障排查', '兼容性'],
  },
  {
    pattern: /\/docs\/api(\/|$)|\/docs\/options(\/|$)|\/docs\/api-v2(\/|$)/,
    keywords: ['API', '配置项', '接口文档'],
  },
  {
    pattern: /\/docs\/ai(\/|$)/,
    keywords: ['AI 编程', 'LLM', '工作流'],
  },
  {
    pattern: /\/blog(\/|$)/,
    keywords: ['博客', '最佳实践'],
  },
]

const KEYWORD_SPLIT_RE = /[，,、|/]/g
const CODE_BLOCK_RE = /```[\s\S]*?```/g
const INLINE_CODE_RE = /`([^`]+)`/g
const IMAGE_LINK_RE = /!\[[^\]]*\]\([^)]*\)/g
const MD_LINK_RE = /\[([^\]]+)\]\([^)]*\)/g
const HTML_TAG_RE = /<[^>]+>/g
const TITLE_TERM_RE = /[\p{L}\p{N}#+.-]+/gu
const HYPHEN_UNDERSCORE_RE = /[-_]/g
const WHITESPACE_RE = /\s+/g
const TRAILING_SLASH_RE = /\/$/

function normalizeKeywords(input?: string[] | string | null): string[] {
  if (!input) {
    return []
  }
  if (Array.isArray(input)) {
    return input.map(item => String(item).trim()).filter(Boolean)
  }
  return String(input)
    .split(KEYWORD_SPLIT_RE)
    .map(item => item.trim())
    .filter(Boolean)
}

function stripMarkdown(content: string) {
  return content
    .replace(CODE_BLOCK_RE, ' ')
    .replace(INLINE_CODE_RE, '$1')
    .replace(IMAGE_LINK_RE, ' ')
    .replace(MD_LINK_RE, '$1')
    .replace(HTML_TAG_RE, ' ')
}

function extractTitleTerms(title: string) {
  return (title.match(TITLE_TERM_RE) || [])
    .map(item => item.trim())
    .filter(item => item.length >= 2)
}

function extractPermalinkTerms(permalink: string) {
  return permalink
    .split('/')
    .filter(Boolean)
    .map(segment => decodeURIComponent(segment))
    .map(segment => segment.replace(HYPHEN_UNDERSCORE_RE, ' '))
    .map(segment => segment.trim())
    .filter(item => item.length >= 2)
}

export function resolveSeoDescription(params: {
  description?: string
  title: string
  fallbackText?: string
  maxLength?: number
}) {
  const maxLength = params.maxLength ?? 140
  const raw = [params.description, params.fallbackText, `${params.title} - weapp-tailwindcss 文档`]
    .find(Boolean) || `${params.title} - weapp-tailwindcss 文档`
  const normalized = stripMarkdown(String(raw)).replace(WHITESPACE_RE, ' ').trim()
  if (!normalized) {
    return `${params.title} - weapp-tailwindcss 文档`
  }
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}…`
}

export function resolveSeoKeywords(params: {
  title: string
  permalink: string
  metadataKeywords?: string[] | string
  frontMatterKeywords?: string[] | string
  maxItems?: number
}) {
  const fromSection = sectionKeywords
    .filter(item => item.pattern.test(params.permalink))
    .flatMap(item => item.keywords)

  const merged = [
    ...normalizeKeywords(params.metadataKeywords),
    ...normalizeKeywords(params.frontMatterKeywords),
    ...fromSection,
    ...extractTitleTerms(params.title),
    ...extractPermalinkTerms(params.permalink),
    ...baseKeywords,
  ]
  const deduped = [...new Set(
    merged
      .map(item => item.trim())
      .filter(Boolean),
  )]
  return deduped.slice(0, params.maxItems ?? 20)
}

export function buildBreadcrumbJsonLd(params: {
  siteUrl: string
  permalink: string
  title: string
}) {
  const rootUrl = params.siteUrl.replace(TRAILING_SLASH_RE, '')
  const segments = params.permalink.split('/').filter(Boolean)
  const names: string[] = ['首页']
  const items: string[] = [rootUrl]
  let current = ''

  for (const segment of segments) {
    current += `/${segment}`
    items.push(`${rootUrl}${current}`)
    if (segment === 'docs') {
      names.push('文档')
      continue
    }
    if (segment === 'blog') {
      names.push('博客')
      continue
    }
    names.push(decodeURIComponent(segment).replace(HYPHEN_UNDERSCORE_RE, ' '))
  }

  if (!segments.length || names.at(-1) !== params.title) {
    names.push(params.title)
    items.push(`${rootUrl}${params.permalink}`)
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': names.map((name, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      name,
      'item': items[index] ?? `${rootUrl}${params.permalink}`,
    })),
  }
}
