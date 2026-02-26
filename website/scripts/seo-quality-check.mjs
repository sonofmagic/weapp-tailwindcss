import process from 'node:process'
import { scanSeoQuality, summarizeByType } from './seo-quality-lib.mjs'
import {
  blogRoot,
  docsRoot,
} from './seo-shared.mjs'

function parseArgs(argv) {
  const options = {
    strict: false,
    maxIssues: 0,
  }
  for (const arg of argv) {
    if (arg === '--strict') {
      options.strict = true
      continue
    }
    if (arg.startsWith('--max-issues=')) {
      options.maxIssues = Number(arg.slice('--max-issues='.length)) || 0
    }
  }
  return options
}

const options = parseArgs(process.argv.slice(2))
const docs = scanSeoQuality(docsRoot, 'docs')
const blog = scanSeoQuality(blogRoot, 'blog')
const issues = [...docs.issues, ...blog.issues]

const grouped = summarizeByType(issues)

console.table([
  { scope: 'docs', files: docs.files.length, issues: docs.issues.length },
  { scope: 'blog', files: blog.files.length, issues: blog.issues.length },
  { scope: 'all', files: docs.files.length + blog.files.length, issues: issues.length },
])

if (Object.keys(grouped).length > 0) {
  console.table(
    Object.entries(grouped).map(([type, count]) => ({
      type,
      count,
    })),
  )
}

if (issues.length > 0) {
  const preview = options.maxIssues > 0 ? issues.slice(0, options.maxIssues) : issues.slice(0, 50)
  for (const issue of preview) {
    console.log(`[${issue.scope}] ${issue.file} - ${issue.type}: ${issue.message}`)
  }
  if (issues.length > preview.length) {
    console.log(`... 其余 ${issues.length - preview.length} 条问题未展示`)
  }
}

if (!options.strict) {
  process.exit(0)
}

if (issues.length === 0) {
  console.log('SEO 质量检查通过。')
  process.exit(0)
}

console.error(`SEO 质量检查失败，共 ${issues.length} 条问题。`)
process.exit(1)
