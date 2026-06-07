import type { CaseResult, RuntimeContext } from './types.ts'
import fs from 'node:fs/promises'
import path from 'pathe'
import { compareImages } from './compare.ts'

export function createCrossPlatformComparisons(results: CaseResult[], context: RuntimeContext) {
  const byName = new Map<string, CaseResult[]>()
  for (const result of results) {
    const list = byName.get(result.name) ?? []
    list.push(result)
    byName.set(result.name, list)
  }
  for (const [name, entries] of byName) {
    const h5 = entries.find(item => item.platform === 'h5' && item.screenshot)
    const weapp = entries.find(item => item.platform === 'weapp' && item.screenshot)
    if (!h5?.screenshot || !weapp?.screenshot) {
      continue
    }
    const compared = compareImages(h5.screenshot, weapp.screenshot, name, context)
    h5.comparison = { target: 'weapp', ...compared }
    h5.diff = compared.diff
    weapp.comparison = { target: 'h5', ...compared }
    weapp.diff = compared.diff
  }
}

export async function writeReport(results: CaseResult[], context: RuntimeContext) {
  createCrossPlatformComparisons(results, context)
  const reportJson = path.join(context.artifactRoot, 'report.json')
  const reportMd = path.join(context.artifactRoot, 'report.md')
  await fs.writeFile(reportJson, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
  const summary = countResults(results)
  const comparisons = results.filter(item => item.comparison && item.platform === 'h5')
  const visualRows = results.map((item) => {
    const screenshot = item.screenshot ? renderImageLink(context, item.screenshot, `${item.platform}-${item.name}`) : ''
    const diff = item.diff ? renderImageLink(context, item.diff, `diff-${item.name}`) : ''
    const comparison = item.comparison ? `ratio=${item.comparison.ratio}` : ''
    const error = item.error ? item.error.split('\n')[0] : ''
    return `| ${item.name} | ${item.platform} | ${item.status} | ${screenshot} | ${diff} | ${comparison} | ${error} |`
  })
  const rows = results.map((item) => {
    const screenshot = item.screenshot ? `[截图](${path.relative(context.artifactRoot, item.screenshot)})` : ''
    const diff = item.diff ? `[diff](${path.relative(context.artifactRoot, item.diff)})` : ''
    const comparison = item.comparison ? `ratio=${item.comparison.ratio}` : ''
    const error = item.error ? item.error.split('\n')[0] : ''
    return `| ${item.name} | ${item.platform} | ${item.status} | ${screenshot} | ${diff} | ${comparison} | ${error} |`
  })
  await fs.writeFile(reportMd, [
    '# Demo Visual E2E Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- H5: ${summary.h5.passed} passed, ${summary.h5.failed} failed, ${summary.h5.skipped} skipped`,
    `- WeApp: ${summary.weapp.passed} passed, ${summary.weapp.failed} failed, ${summary.weapp.skipped} skipped`,
    `- Screenshots: ${results.filter(item => item.screenshot).length}`,
    `- Cross-platform comparisons: ${comparisons.length}`,
    '',
    '## Visual Matrix',
    '',
    '| Demo | Platform | Status | Screenshot | Diff | Comparison | Error |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...visualRows,
    '',
    '## Link Matrix',
    '',
    '| Demo | Platform | Status | Screenshot | Diff | Comparison | Error |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n'))
}

function countResults(results: CaseResult[]) {
  const initial = {
    passed: 0,
    failed: 0,
    skipped: 0,
  }
  const summary = {
    h5: { ...initial },
    weapp: { ...initial },
  }
  for (const result of results) {
    summary[result.platform][result.status] += 1
  }
  return summary
}

function renderImageLink(context: RuntimeContext, file: string, alt: string) {
  const relative = path.relative(context.artifactRoot, file)
  return `<img src="${relative}" alt="${alt}" width="180" />`
}
