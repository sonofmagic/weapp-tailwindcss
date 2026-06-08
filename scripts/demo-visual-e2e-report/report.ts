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
    for (const platform of ['weapp', 'app-android', 'app-ios'] as const) {
      const target = entries.find(item => item.platform === platform && item.screenshot)
      if (!h5?.screenshot || !target?.screenshot) {
        continue
      }
      const comparisonName = `${name}-${platform}`
      const compared = compareImages(h5.screenshot, target.screenshot, comparisonName, context)
      h5.comparison = { target: platform, ...compared }
      h5.diff = compared.diff
      target.comparison = { target: 'h5', ...compared }
      target.diff = compared.diff
    }
  }
}

export async function writeReport(results: CaseResult[], context: RuntimeContext) {
  createHmrComparisons(results, context)
  createCrossPlatformComparisons(results, context)
  const reportJson = path.join(context.artifactRoot, 'report.json')
  const reportMd = path.join(context.artifactRoot, 'report.md')
  await fs.writeFile(reportJson, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
  const summary = countResults(results)
  const comparisons = results.filter(item => item.comparison && item.platform === 'h5')
  const visualRows = results.map((item) => {
    const screenshot = item.screenshot ? renderImageLink(context, item.screenshot, `${item.platform}-${item.name}`) : ''
    const hmrBefore = item.hmrBeforeScreenshot ? renderImageLink(context, item.hmrBeforeScreenshot, `${item.platform}-${item.name}-hmr-before`) : ''
    const hmrAfter = item.hmrAfterScreenshot ? renderImageLink(context, item.hmrAfterScreenshot, `${item.platform}-${item.name}-hmr-after`) : ''
    const diff = renderDiffLinks(context, item)
    const comparison = item.comparison ? `ratio=${item.comparison.ratio}` : ''
    const error = item.error ? item.error.split('\n')[0] : ''
    return `| ${item.name} | ${item.platform} | ${item.status} | ${screenshot} | ${hmrBefore} | ${hmrAfter} | ${diff} | ${comparison} | ${error} |`
  })
  const rows = results.map((item) => {
    const screenshot = item.screenshot ? `[截图](${path.relative(context.artifactRoot, item.screenshot)})` : ''
    const hmrBefore = item.hmrBeforeScreenshot ? `[HMR 前](${path.relative(context.artifactRoot, item.hmrBeforeScreenshot)})` : ''
    const hmrAfter = item.hmrAfterScreenshot ? `[HMR 后](${path.relative(context.artifactRoot, item.hmrAfterScreenshot)})` : ''
    const diff = renderDiffTextLinks(context, item)
    const comparison = item.comparison ? `ratio=${item.comparison.ratio}` : ''
    const error = item.error ? item.error.split('\n')[0] : ''
    return `| ${item.name} | ${item.platform} | ${item.status} | ${screenshot} | ${hmrBefore} | ${hmrAfter} | ${diff} | ${comparison} | ${error} |`
  })
  const hmrPairs = results.filter(item => item.hmrBeforeScreenshot && item.hmrAfterScreenshot)
  await fs.writeFile(reportMd, [
    '# Demo Visual E2E Report',
    '',
    `Generated at: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    ...Object.entries(summary).map(([platform, item]) => {
      return `- ${platform}: ${item.passed} passed, ${item.failed} failed, ${item.skipped} skipped`
    }),
    `- Screenshots: ${results.filter(item => item.screenshot).length}`,
    `- HMR visual pairs: ${hmrPairs.length}`,
    `- Cross-platform comparisons: ${comparisons.length}`,
    '',
    '## Visual Matrix',
    '',
    '| Demo | Platform | Status | Screenshot | HMR Before | HMR After | Diff | Comparison | Error |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...visualRows,
    '',
    '## Link Matrix',
    '',
    '| Demo | Platform | Status | Screenshot | HMR Before | HMR After | Diff | Comparison | Error |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows,
    '',
  ].join('\n'))
}

function createHmrComparisons(results: CaseResult[], context: RuntimeContext) {
  for (const item of results) {
    if (!item.hmrBeforeScreenshot || !item.hmrAfterScreenshot) {
      continue
    }
    const compared = compareImages(
      item.hmrAfterScreenshot,
      item.hmrBeforeScreenshot,
      `${item.name}-${item.platform}-hmr`,
      context,
    )
    item.hmrDiff = compared.diff
    item.diagnostics = {
      ...item.diagnostics,
      hmrVisualDiff: {
        differentPixels: compared.differentPixels,
        ratio: compared.ratio,
      },
    }
  }
}

function countResults(results: CaseResult[]) {
  const createInitial = () => ({
    passed: 0,
    failed: 0,
    skipped: 0,
  })
  const summary: Record<CaseResult['platform'], ReturnType<typeof createInitial>> = {
    'app-android': createInitial(),
    'app-ios': createInitial(),
    'h5': createInitial(),
    'weapp': createInitial(),
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

function renderDiffLinks(context: RuntimeContext, item: CaseResult) {
  const links = [
    item.hmrDiff ? renderImageLink(context, item.hmrDiff, `hmr-diff-${item.platform}-${item.name}`) : '',
    item.diff ? renderImageLink(context, item.diff, `diff-${item.platform}-${item.name}`) : '',
  ].filter(Boolean)
  return links.join('<br />')
}

function renderDiffTextLinks(context: RuntimeContext, item: CaseResult) {
  const links = [
    item.hmrDiff ? `[HMR diff](${path.relative(context.artifactRoot, item.hmrDiff)})` : '',
    item.diff ? `[跨端 diff](${path.relative(context.artifactRoot, item.diff)})` : '',
  ].filter(Boolean)
  return links.join('<br />')
}
