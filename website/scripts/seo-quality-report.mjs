import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { scanSeoQuality, summarizeByType, toCoverageRatio } from './seo-quality-lib.mjs'
import { blogRoot, docsRoot } from './seo-shared.mjs'
import { writeStableJson } from './write-stable-json.mjs'

function parseArgs(argv) {
  const options = {
    output: '',
  }
  for (const arg of argv) {
    if (arg.startsWith('--output=')) {
      options.output = arg.slice('--output='.length)
    }
  }
  return options
}

const options = parseArgs(process.argv.slice(2))

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const websiteRoot = path.resolve(currentDir, '..')
const outputFile = options.output
  ? path.resolve(process.cwd(), options.output)
  : path.join(websiteRoot, 'static', 'seo-quality-report.json')

export function createSeoQualityPayload(now = new Date().toISOString()) {
  const docs = scanSeoQuality(docsRoot, 'docs')
  const blog = scanSeoQuality(blogRoot, 'blog')
  const issues = [...docs.issues, ...blog.issues]
  const issueTypes = summarizeByType(issues)

  const allCoverage = {
    total: docs.coverage.total + blog.coverage.total,
    withTitle: docs.coverage.withTitle + blog.coverage.withTitle,
    withDescription: docs.coverage.withDescription + blog.coverage.withDescription,
    withKeywords: docs.coverage.withKeywords + blog.coverage.withKeywords,
  }

  return {
    version: '1.0.0',
    generatedAt: now,
    totals: {
      files: docs.files.length + blog.files.length,
      issues: issues.length,
    },
    coverage: {
      docs: toCoverageRatio(docs.coverage),
      blog: toCoverageRatio(blog.coverage),
      all: toCoverageRatio(allCoverage),
    },
    issueTypes,
    issues: issues.slice(0, 200),
  }
}

function main() {
  const payload = createSeoQualityPayload()
  const changed = writeStableJson(outputFile, payload)
  const suffix = changed ? '' : '（内容未变化，跳过写入）'
  console.log(`SEO 质量报告已生成: ${path.relative(websiteRoot, outputFile)} (issues=${payload.totals.issues})${suffix}`)
}

main()
