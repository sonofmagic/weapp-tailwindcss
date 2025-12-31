import { Buffer } from 'node:buffer'
import { setDefaultResultOrder } from 'node:dns'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { ProxyAgent, setGlobalDispatcher } from 'undici'

setDefaultResultOrder('ipv4first')

interface GitHubIssue {
  title: string
  html_url: string
  updated_at: string
}

interface GitHubUser {
  login: string
  html_url: string
}

interface GitHubComment {
  id: number
  body: string
  user: GitHubUser
  created_at: string
  html_url: string
}

interface RemoteImage {
  url: string
  alt?: string
}

interface ShowcaseImage {
  alt: string
  src: string
  originUrl: string
  downloaded: boolean
}

interface DisplayValue {
  text: string
  url?: string
}

interface ParsedEntry {
  id: number
  commentUrl: string
  createdAt: string
  author: GitHubUser
  name: string
  link?: DisplayValue
  github?: DisplayValue
  description?: string
  remoteImages: RemoteImage[]
  slugSource: string
}

interface GeneratedEntry extends ParsedEntry {
  order: number
  slug: string
  images: ShowcaseImage[]
}

interface ShowcaseConfigEntry {
  hidden?: boolean
  images?: string[]
}

interface ShowcaseConfig {
  entries?: Record<string, ShowcaseConfigEntry>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const showcaseDocsPath = path.resolve(repoRoot, 'website/docs/showcase/index.mdx')
const showcaseImageRoot = path.resolve(repoRoot, 'website/static/img/showcase')
const showcaseConfigPath = path.resolve(repoRoot, 'website/docs/showcase/config.json')

const env = process.env as NodeJS.ProcessEnv & {
  SHOWCASE_REPO?: string
  SHOWCASE_ISSUE?: string
  SHOWCASE_IMAGE_TIMEOUT?: string
  SHOWCASE_IMAGE_RETRY?: string
  SHOWCASE_SKIP_IMAGES?: string
  SHOWCASE_PROXY?: string
  HTTPS_PROXY?: string
  HTTP_PROXY?: string
  GITHUB_TOKEN?: string
  GH_TOKEN?: string
}

const repo = env.SHOWCASE_REPO ?? 'sonofmagic/weapp-tailwindcss'
const issueNumber = Number(env.SHOWCASE_ISSUE ?? '270')

if (Number.isNaN(issueNumber)) {
  throw new TypeError('SHOWCASE_ISSUE must be a valid number')
}

function parseProxyOption(args: string[]): { enabled: boolean, url?: string } {
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (!arg) {
      continue
    }

    if (arg === '--no-proxy') {
      return { enabled: false }
    }

    if (arg === '--proxy') {
      const next = args[index + 1]
      if (next && !next.startsWith('-')) {
        return { enabled: true, url: next }
      }
      return { enabled: true }
    }

    if (arg.startsWith('--proxy=')) {
      const url = arg.slice('--proxy='.length).trim()
      return url ? { enabled: true, url } : { enabled: true }
    }
  }

  return { enabled: false }
}

const apiBase = `https://api.github.com/repos/${repo}`
const issueApiUrl = `${apiBase}/issues/${issueNumber}`
const commentsApiUrl = `${issueApiUrl}/comments`
const parsedTimeout = Number(env.SHOWCASE_IMAGE_TIMEOUT ?? '20000')
const imageTimeoutMs = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 20000
const parsedAttempts = Number(env.SHOWCASE_IMAGE_RETRY ?? '3')
const maxDownloadAttempts = Number.isFinite(parsedAttempts) && parsedAttempts > 0 ? parsedAttempts : 3
const skipImageDownload = /^1|true$/i.test(env.SHOWCASE_SKIP_IMAGES ?? '')
const proxyOption = parseProxyOption(process.argv.slice(2))
const defaultProxyUrl
  = env.SHOWCASE_PROXY
    ?? env.HTTPS_PROXY
    ?? env.HTTP_PROXY
    ?? 'http://127.0.0.1:7890'
const proxyUrl = proxyOption.enabled ? (proxyOption.url?.trim() || defaultProxyUrl) : null

if (proxyUrl && proxyOption.enabled) {
  try {
    const agent = new ProxyAgent(proxyUrl)
    setGlobalDispatcher(agent)
    console.log(`🌐  GitHub requests will use proxy: ${proxyUrl}`)
  }
  catch (error) {
    console.warn(`⚠️  Failed to configure proxy (${proxyUrl}):`, error)
  }
}

const token = env.GITHUB_TOKEN ?? env.GH_TOKEN
const baseHeaders: { 'User-Agent': string, 'Authorization'?: string } = {
  'User-Agent': 'weapp-tailwindcss-showcase-script',
}

if (token) {
  baseHeaders.Authorization = `Bearer ${token}`
}

const apiHeaders: Record<string, string> = {
  ...baseHeaders,
  Accept: 'application/vnd.github+json',
}

const mediaHeaders: Record<string, string> = {
  ...baseHeaders,
  Accept: 'image/avif,image/webp,image/png,image/jpeg;q=0.9,*/*;q=0.8',
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeZone: 'Asia/Shanghai',
})

const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Shanghai',
})

async function loadShowcaseConfig(): Promise<ShowcaseConfig> {
  try {
    const raw = await fs.readFile(showcaseConfigPath, 'utf8')
    return JSON.parse(raw) as ShowcaseConfig
  }
  catch (error) {
    const err = error as NodeJS.ErrnoException
    if (err.code === 'ENOENT') {
      return { entries: {} }
    }
    throw error
  }
}

function matchImageSelector(image: ShowcaseImage, selector: string): boolean {
  const normalized = selector.trim()
  if (!normalized) {
    return false
  }

  if (normalized === image.originUrl || normalized === image.src) {
    return true
  }

  const srcBasename = path.basename(image.src)
  if (normalized === srcBasename) {
    return true
  }

  try {
    const originBasename = path.basename(new URL(image.originUrl).pathname)
    if (normalized === originBasename) {
      return true
    }
  }
  catch (_error) {
    // ignore
  }

  return false
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: apiHeaders })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}\n${body}`)
  }

  return response.json() as Promise<T>
}

async function fetchAllComments(): Promise<GitHubComment[]> {
  const results: GitHubComment[] = []
  let page = 1

  while (true) {
    const url = `${commentsApiUrl}?per_page=100&page=${page}`
    const chunk = await fetchJson<GitHubComment[]>(url)

    if (!Array.isArray(chunk) || chunk.length === 0) {
      break
    }

    results.push(...chunk)

    if (chunk.length < 100) {
      break
    }

    page += 1
  }

  return results
}

function sanitizeUrl(value: string | undefined | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    return null
  }

  return trimmed
}

function stripImages(body: string): { text: string, images: RemoteImage[] } {
  const seen = new Set<string>()
  const images: RemoteImage[] = []
  const segments: Array<{ start: number, end: number }> = []

  const markdownImagePattern = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g
  const htmlImagePattern = /<img\b[^>]*>/gi

  for (const match of body.matchAll(markdownImagePattern)) {
    const url = sanitizeUrl(match[2])
    if (!url) {
      continue
    }
    if (!seen.has(url)) {
      const alt = match[1]?.trim()
      images.push(alt ? { url, alt } : { url })
      seen.add(url)
    }
    const start = match.index ?? 0
    segments.push({ start, end: start + match[0].length })
  }

  for (const match of body.matchAll(htmlImagePattern)) {
    const raw = match[0]
    const srcMatch = raw.match(/src=["']([^"']+)["']/i)
    const url = sanitizeUrl(srcMatch?.[1])
    if (!url) {
      continue
    }
    if (!seen.has(url)) {
      const altMatch = raw.match(/alt=["']([^"']*)["']/i)
      const alt = altMatch?.[1]?.trim()
      images.push(alt ? { url, alt } : { url })
      seen.add(url)
    }
    const start = match.index ?? 0
    segments.push({ start, end: start + raw.length })
  }

  if (!segments.length) {
    return { text: body ?? '', images }
  }

  segments.sort((a, b) => a.start - b.start)

  let lastIndex = 0
  let text = ''
  for (const segment of segments) {
    text += body.slice(lastIndex, segment.start)
    lastIndex = segment.end
  }
  text += body.slice(lastIndex)

  return { text, images }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithTimeout(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { headers, signal: controller.signal })
  }
  finally {
    clearTimeout(timeout)
  }
}

function normalizeLabel(label: string): 'name' | 'link' | 'github' | 'description' | null {
  const normalized = label.trim().toLowerCase()
  const presets: Record<'name' | 'link' | 'github' | 'description', RegExp[]> = {
    name: [
      /小程序名称/,
      /小程序名字/,
      /小程序名/,
      /项目名称/,
      /产品名称/,
      /项目名/,
      /product\s*name/,
      /program\s*name/,
      /^name$/,
      /^title$/,
      /mini\s*program/,
    ],
    link: [/链接/, /link/, /website/, /官网/, /地址/],
    github: [/github/, /git/, /仓库/, /repo/],
    description: [/介绍/, /简介/, /描述/, /description/, /项目/, /产品/],
  }

  for (const [key, patterns] of Object.entries(presets) as Array<[
    'name' | 'link' | 'github' | 'description',
    RegExp[],
  ]>) {
    if (patterns.some(regex => regex.test(normalized))) {
      return key
    }
  }

  return null
}

function parseDisplayValue(value: string): DisplayValue | undefined {
  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const markdownLinkMatch = trimmed.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (markdownLinkMatch) {
    const url = sanitizeUrl(markdownLinkMatch[2])
    const urlText = url ?? ''
    const text = markdownLinkMatch[1]?.trim() || urlText || trimmed
    return url ? { text, url } : { text }
  }

  const urlMatch = trimmed.match(/https?:\/\/\S+/)
  if (urlMatch) {
    const url = sanitizeUrl(urlMatch[0])
    const text = trimmed.replace(urlMatch[0], '').trim() || urlMatch[0]
    return url ? { text, url } : { text }
  }

  return { text: trimmed }
}

function sanitizeDescriptionContent(value: string): string {
  return value.replace(/^#{1,6}\s+/gm, '').trim()
}

function parseComment(comment: GitHubComment): ParsedEntry | null {
  if (!comment.body) {
    return null
  }

  const { text, images } = stripImages(comment.body)
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  let name: string | undefined
  let link: DisplayValue | undefined
  let github: DisplayValue | undefined
  let description: string | undefined
  const extra: string[] = []

  for (const originalLine of lines) {
    if (/^\|/.test(originalLine) || /^-+$/.test(originalLine)) {
      continue
    }

    const line = originalLine.replace(/^[*-]\s*/, '').trim()
    const keyValueMatch = line.match(/^([^：:]+)[：:](.*)$/)

    if (keyValueMatch) {
      const rawLabel = keyValueMatch[1]?.trim()
      const rawValue = keyValueMatch[2]
      if (!rawLabel || rawValue == null) {
        extra.push(originalLine)
        continue
      }
      const normalized = normalizeLabel(rawLabel)
      const value = rawValue.trim()
      if (normalized === 'name' && !name) {
        name = value
        continue
      }
      if (normalized === 'link' && !link) {
        link = parseDisplayValue(value)
        continue
      }
      if (normalized === 'github' && !github) {
        github = parseDisplayValue(value)
        continue
      }
      if (normalized === 'description' && !description) {
        description = value
        continue
      }
    }

    extra.push(originalLine)
  }

  const descriptionParts: string[] = []
  if (description) {
    descriptionParts.push(description)
  }
  if (extra.length) {
    descriptionParts.push(extra.join('\n\n'))
  }

  const programName = name?.trim()
  if (!programName) {
    console.warn(
      `⚠️  Skipping comment ${comment.html_url} because no 小程序名称 was provided. 请按照模板填写「小程序名称」。`,
    )
    return null
  }

  const normalizedDescription = descriptionParts.length
    ? sanitizeDescriptionContent(descriptionParts.join('\n\n'))
    : ''
  const descriptionText = normalizedDescription || undefined

  const parsedEntry: ParsedEntry = {
    id: comment.id,
    commentUrl: comment.html_url,
    createdAt: comment.created_at,
    author: comment.user,
    name: programName,
    remoteImages: images,
    slugSource: programName,
  }

  if (link) {
    parsedEntry.link = link
  }
  if (github) {
    parsedEntry.github = github
  }
  if (descriptionText) {
    parsedEntry.description = descriptionText
  }

  return parsedEntry
}

function slugifySegment(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4E00-\u9FA5.-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || fallback
}

function escapeMarkdown(value: string): string {
  return value.replace(/([\\`*_{}[\]()#+.!|-])/g, '\\$1')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDisplay(display?: DisplayValue): string {
  if (!display) {
    return ''
  }

  const text = escapeMarkdown(display.text)
  if (display.url) {
    return `[${text}](${display.url})`
  }
  return text
}

function resolveImageExtension(contentType: string | null, url: string): string {
  const contentMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/bmp': 'bmp',
    'image/avif': 'avif',
  }

  if (contentType) {
    const normalized = contentMap[contentType.toLowerCase()]
    if (normalized) {
      return normalized
    }
  }

  try {
    const { pathname } = new URL(url)
    const extMatch = pathname.match(/\.([a-z0-9]+)$/i)
    if (extMatch) {
      const ext = extMatch[1]
      if (ext) {
        return ext.toLowerCase()
      }
    }
  }
  catch (_error) {
    // ignore parsing errors
  }

  return 'jpg'
}

async function downloadImage(
  image: RemoteImage,
  destDir: string,
  entryDirName: string,
  index: number,
): Promise<ShowcaseImage> {
  const response = await fetchWithTimeout(image.url, mediaHeaders, imageTimeoutMs)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const ext = resolveImageExtension(response.headers.get('content-type'), image.url)
  const safeAlt = slugifySegment(image.alt ?? `image-${index + 1}`, `image-${index + 1}`)
  const fileName = `${String(index + 1).padStart(2, '0')}-${safeAlt}.${ext}`
  const absolutePath = path.join(destDir, fileName)
  await fs.writeFile(absolutePath, buffer)

  return {
    alt: image.alt?.trim() || '',
    src: `/img/showcase/${entryDirName}/${fileName}`,
    originUrl: image.url,
    downloaded: true,
  }
}

async function downloadImageWithRetry(
  image: RemoteImage,
  destDir: string,
  entryDirName: string,
  index: number,
): Promise<ShowcaseImage | null> {
  for (let attempt = 1; attempt <= maxDownloadAttempts; attempt += 1) {
    try {
      return await downloadImage(image, destDir, entryDirName, index)
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(
        `⚠️  Download failed (${attempt}/${maxDownloadAttempts}) for ${image.url}: ${message}`,
      )
      if (attempt >= maxDownloadAttempts) {
        break
      }
      await delay(500 * attempt)
    }
  }

  return null
}

function renderImageGrid(
  images: ShowcaseImage[],
  className = 'grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4',
  indent = 0,
  altFallback = '',
  imageClass = 'rounded-xl border border-gray-100 dark:border-gray-800',
): string[] {
  const pad = ' '.repeat(indent)
  const lines: string[] = []
  lines.push(`${pad}<div className="${className}">`)
  for (const image of images) {
    const alt = escapeHtml(image.alt || altFallback)
    const source = image.src
    lines.push(
      `${pad}  <img loading="lazy" src="${source}" alt="${alt}" className="${imageClass}" />`,
    )
  }
  lines.push(`${pad}</div>`)
  return lines
}

function renderEntry(entry: GeneratedEntry): string {
  const lines: string[] = []
  lines.push('<div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/40 p-4 shadow-sm hover:shadow-md transition-shadow">')
  lines.push('')
  const titleText = entry.name
  const headingLabel = escapeMarkdown(titleText)
  const heading = entry.link?.url ? `[${headingLabel}](${entry.link.url})` : headingLabel
  lines.push(`### ${heading}`)
  lines.push('')
  const login = entry.author?.login ? `[@${entry.author.login}](${entry.author.html_url})` : '匿名'
  lines.push(`**提交者**：${login} · ${dateFormatter.format(new Date(entry.createdAt))} · [查看评论](${entry.commentUrl})  `)

  const metaLines: string[] = []
  if (entry.link) {
    metaLines.push(`**链接**：${formatDisplay(entry.link)}`)
  }
  if (entry.github) {
    metaLines.push(`**GitHub**：${formatDisplay(entry.github)}`)
  }

  if (metaLines.length) {
    lines.push(metaLines.join('  \n'))
    lines.push('')
  }

  if (entry.description) {
    lines.push(entry.description)
    lines.push('')
  }

  if (entry.images.length === 0) {
    lines.push('</div>')
    return lines.join('\n')
  }

  const [primary, ...others] = entry.images
  if (primary) {
    lines.push(
      ...renderImageGrid(
        [primary],
        'grid grid-cols-1 sm:grid-cols-1 gap-3 mt-4',
        0,
        titleText,
        'h-64 w-full object-contain rounded-xl border border-gray-100 dark:border-gray-800',
      ),
    )
  }

  if (others.length) {
    lines.push('<details className="mt-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/30 p-3">')
    lines.push(
      `  <summary className="cursor-pointer list-none font-medium text-sm text-gray-600 dark:text-gray-300">📸 展开查看其余 ${others.length} 张图片</summary>`,
    )
    lines.push('  <div className="pt-3">')
    lines.push(
      ...renderImageGrid(
        others,
        'grid grid-cols-2 sm:grid-cols-3 gap-3',
        4,
        titleText,
        'h-48 w-full object-contain rounded-xl border border-gray-100 dark:border-gray-800',
      ),
    )
    lines.push('  </div>')
    lines.push('</details>')
  }

  lines.push('</div>')
  return lines.join('\n')
}

function renderMdx(issue: GitHubIssue, entries: GeneratedEntry[]): string {
  const generatedAt = dateTimeFormatter.format(new Date())
  const header = `<!-- ⚠️ 该文件由 scripts/update-showcase.ts 自动生成。请运行 \`pnpm showcase:update\` 以刷新数据。 -->`
  const intro = [
    '# 优秀案例展示',
    '',
    `以下内容来自 [${issue.title}](${issue.html_url})，列表顺序按照提交时间排序。`,
    '',
    `> 最近同步：${generatedAt}`,
    '',
    '<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">',
  ]

  const cards = entries.map(renderEntry)
  const footer = ['</div>', '']

  return [header, '', ...intro, ...cards, ...footer].join('\n')
}

async function main() {
  console.log(`🔄 Fetching issue #${issueNumber} from ${repo}...`)
  const issue = await fetchJson<GitHubIssue>(issueApiUrl)
  const comments = await fetchAllComments()
  console.log(`📥 Received ${comments.length} comments, parsing entries...`)

  const config = await loadShowcaseConfig()

  const parsed = comments
    .map(comment => parseComment(comment))
    .filter((entry): entry is ParsedEntry => Boolean(entry))

  if (!parsed.length) {
    throw new Error('No valid showcase entries were found in the issue comments.')
  }

  parsed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  if (!skipImageDownload) {
    await fs.emptyDir(showcaseImageRoot)
  }
  else {
    console.log('⚠️  Skipping local image downloads (SHOWCASE_SKIP_IMAGES=1). Existing assets will be preserved.')
  }

  const generatedEntries: GeneratedEntry[] = []

  for (const [index, entry] of parsed.entries()) {
    const titleText = entry.name
    const slug = slugifySegment(entry.name, `entry-${entry.id}`)
    const dirName = `${String(index + 1).padStart(3, '0')}.${slug}`
    const entryDir = path.join(showcaseImageRoot, dirName)
    const entryTag = `${titleText}（slug: ${slug}）`

    if (!entry.remoteImages.length) {
      console.warn(`⚠️  跳过 ${entryTag}（${entry.commentUrl}），因为没有提供任何图片。`)
      continue
    }

    const allImages: ShowcaseImage[] = []

    if (skipImageDownload) {
      entry.remoteImages.forEach((remote) => {
        allImages.push({
          alt: remote.alt?.trim() || '',
          src: remote.url,
          originUrl: remote.url,
          downloaded: false,
        })
      })
    }
    else {
      await fs.ensureDir(entryDir)
      const downloads = entry.remoteImages.map((image, imgIndex) =>
        downloadImageWithRetry(image, entryDir, dirName, imgIndex),
      )
      const resolved = await Promise.all(downloads)
      resolved.forEach((local, idx) => {
        if (local) {
          allImages.push(local)
          return
        }

        const fallback = entry.remoteImages[idx]
        if (!fallback) {
          return
        }
        allImages.push({
          alt: fallback.alt?.trim() || '',
          src: fallback.url,
          originUrl: fallback.url,
          downloaded: false,
        })
      })
    }

    if (!allImages.length) {
      console.warn(`⚠️  跳过 ${entryTag}（${entry.commentUrl}），因为图片下载失败。`)
      continue
    }

    const configEntry = config.entries?.[slug]
    if (configEntry?.hidden) {
      console.log(`ℹ️  ${entryTag} 已被 config.json 隐藏。`)
      continue
    }

    const manualSelectors = configEntry?.images?.filter(value => value && value.trim())
    let selectedImages: ShowcaseImage[] = []

    if (manualSelectors?.length) {
      const missingSelectors: string[] = []
      selectedImages = manualSelectors
        .map((selector) => {
          const matched = allImages.find(img => matchImageSelector(img, selector))
          if (!matched) {
            missingSelectors.push(selector)
          }
          return matched
        })
        .filter((img): img is ShowcaseImage => Boolean(img))

      if (missingSelectors.length) {
        console.warn(
          `⚠️  ${entryTag} 的 config.json 中部分 images 无法匹配：${missingSelectors.join(', ')}`,
        )
      }
    }
    else {
      selectedImages = allImages
    }

    if (!selectedImages.length) {
      console.warn(`⚠️  ${entryTag} 的图片选择为空，将展示全部图片。`)
      selectedImages = allImages
    }

    generatedEntries.push({
      ...entry,
      order: index + 1,
      slug,
      images: selectedImages,
    })
  }

  const mdxContent = renderMdx(issue, generatedEntries)
  await fs.writeFile(showcaseDocsPath, mdxContent, 'utf8')
  console.log(`✅ Showcase updated with ${generatedEntries.length} entries.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
