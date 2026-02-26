import path from 'node:path'
import process from 'node:process'
import { blogRoot, docsRoot, readMatterFile, walkMarkdownFiles } from './seo-shared.mjs'

function parseArgs(argv) {
  const options = {
    strict: false,
    minDescriptionCoverage: 0.95,
    minKeywordsCoverage: 0.9,
  }
  for (const arg of argv) {
    if (arg === '--strict') {
      options.strict = true
      continue
    }
    if (arg.startsWith('--min-description=')) {
      options.minDescriptionCoverage = Number(arg.slice('--min-description='.length))
      continue
    }
    if (arg.startsWith('--min-keywords=')) {
      options.minKeywordsCoverage = Number(arg.slice('--min-keywords='.length))
    }
  }
  return options
}

function createStats() {
  return {
    total: 0,
    withTitle: 0,
    withDescription: 0,
    withKeywords: 0,
  }
}

function updateStats(stats, data) {
  stats.total += 1
  if (typeof data.title === 'string' && data.title.trim()) {
    stats.withTitle += 1
  }
  if (typeof data.description === 'string' && data.description.trim()) {
    stats.withDescription += 1
  }
  if (Array.isArray(data.keywords) ? data.keywords.length > 0 : typeof data.keywords === 'string' && data.keywords.trim()) {
    stats.withKeywords += 1
  }
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}

function toSummary(name, stats) {
  const descriptionCoverage = stats.total ? stats.withDescription / stats.total : 0
  const keywordsCoverage = stats.total ? stats.withKeywords / stats.total : 0
  return {
    name,
    total: stats.total,
    titleCoverage: formatPercent(stats.total ? stats.withTitle / stats.total : 0),
    descriptionCoverage: formatPercent(descriptionCoverage),
    keywordsCoverage: formatPercent(keywordsCoverage),
    descriptionCoverageValue: descriptionCoverage,
    keywordsCoverageValue: keywordsCoverage,
  }
}

function auditDirectory(rootDir, label) {
  const files = walkMarkdownFiles(rootDir)
  const stats = createStats()
  for (const file of files) {
    const { parsed } = readMatterFile(file)
    updateStats(stats, parsed.data || {})
  }
  return {
    label,
    files,
    stats,
  }
}

const options = parseArgs(process.argv.slice(2))

const docs = auditDirectory(docsRoot, 'docs')
const blog = auditDirectory(blogRoot, 'blog')

const summaries = [
  toSummary('docs', docs.stats),
  toSummary('blog', blog.stats),
  toSummary('all', {
    total: docs.stats.total + blog.stats.total,
    withTitle: docs.stats.withTitle + blog.stats.withTitle,
    withDescription: docs.stats.withDescription + blog.stats.withDescription,
    withKeywords: docs.stats.withKeywords + blog.stats.withKeywords,
  }),
]

console.table(
  summaries.map(item => ({
    scope: item.name,
    total: item.total,
    titleCoverage: item.titleCoverage,
    descriptionCoverage: item.descriptionCoverage,
    keywordsCoverage: item.keywordsCoverage,
  })),
)

if (!options.strict) {
  process.exit(0)
}

const strictScope = summaries.find(item => item.name === 'all')
if (!strictScope) {
  process.exit(1)
}

const failures = []
if (strictScope.descriptionCoverageValue < options.minDescriptionCoverage) {
  failures.push(
    `description 覆盖率 ${formatPercent(strictScope.descriptionCoverageValue)} 低于阈值 ${formatPercent(options.minDescriptionCoverage)}`,
  )
}
if (strictScope.keywordsCoverageValue < options.minKeywordsCoverage) {
  failures.push(
    `keywords 覆盖率 ${formatPercent(strictScope.keywordsCoverageValue)} 低于阈值 ${formatPercent(options.minKeywordsCoverage)}`,
  )
}

if (failures.length === 0) {
  console.log('SEO 审计通过。')
  process.exit(0)
}

console.error('SEO 审计失败:')
for (const message of failures) {
  console.error(`- ${message}`)
}
console.error(`检查目录: ${path.relative(process.cwd(), docsRoot)} 与 ${path.relative(process.cwd(), blogRoot)}`)
process.exit(1)
