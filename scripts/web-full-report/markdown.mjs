import fs from 'node:fs/promises'
import path from 'node:path'
import { checksSummary, formatBytes, rel, statusText } from './utils.mjs'

export async function writeMarkdown(context, report) {
  const lines = []
  lines.push('# demo/web full validation report')
  lines.push('')
  lines.push(`Generated at: ${report.generatedAt}`)
  lines.push(`Repository: ${report.repositoryRoot}`)
  lines.push(`HEAD: \`${report.environment.gitHead}\``)
  lines.push(`Node: \`${report.environment.nodeVersion}\`; pnpm: \`${report.environment.pnpmVersion}\``)
  lines.push('')
  lines.push('## Git status')
  lines.push('')
  lines.push('```text')
  lines.push(report.environment.gitStatusBefore.trim() || '(clean)')
  lines.push('```')
  lines.push('')
  lines.push('Note: existing submodule status is treated as pre-existing workspace state and is not included in pass/fail conclusions.')
  lines.push('')
  lines.push('## Overview')
  lines.push('')
  lines.push('| Project | build:web | build:weapp | web render | parity | HMR | web size | weapp size | weapp CSS |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const project of report.projects) {
    const compare = report.compare.projects[project.name]
    const hmr = report.hmr.cases.find(item => item.project === project.name)
    lines.push(`| ${project.name} | ${statusText(project.builds.web.exitCode)} ${project.builds.web.durationMs}ms | ${statusText(project.builds.weapp.exitCode)} ${project.builds.weapp.durationMs}ms | ${compare ? checksSummary(compare.webRender) : 'missing'} | ${compare ? checksSummary(compare.parity) : 'missing'} | ${hmr?.status ?? 'missing'} ${hmr?.sourceWriteToDomUpdateMs ?? '-'}ms | ${formatBytes(project.artifacts.web.totalSize)} | ${formatBytes(project.artifacts.weapp.totalSize)} | ${checksSummary(project.artifacts.weapp.cssChecks)} |`)
  }
  lines.push('')
  lines.push('## Build artifacts')
  lines.push('')
  lines.push('| Project | Target | Output | Files | Total | Gzip total | CSS files | CSS total |')
  lines.push('| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |')
  for (const project of report.projects) {
    for (const target of ['web', 'weapp']) {
      const artifact = project.artifacts[target]
      lines.push(`| ${project.name} | ${target} | \`${artifact.outputDir}\` | ${artifact.fileCount} | ${formatBytes(artifact.totalSize)} | ${formatBytes(artifact.totalGzipSize)} | ${artifact.cssFileCount} | ${formatBytes(artifact.cssTotalSize)} |`)
    }
  }
  lines.push('')
  lines.push('## HMR')
  lines.push('')
  lines.push('| Project | Status | devReadyMs | initialRenderMs | sourceWriteToDomUpdateMs | totalMs |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: |')
  for (const item of report.hmr.cases) {
    lines.push(`| ${item.project} | ${item.status} | ${item.devReadyMs ?? '-'} | ${item.initialRenderMs ?? '-'} | ${item.sourceWriteToDomUpdateMs ?? '-'} | ${item.totalMs ?? '-'} |`)
  }
  lines.push('')
  lines.push('## Compare and screenshots')
  lines.push('')
  lines.push(`Compare report: \`${rel(context.repoRoot, path.join(context.compareOutput, 'report.json'))}\``)
  lines.push('')
  lines.push('| Project | web render | parity | weapp CSS | style diffs | class diffs | screenshots |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | --- |')
  for (const project of report.projects) {
    const compare = report.compare.projects[project.name]
    if (!compare) {
      lines.push(`| ${project.name} | missing | missing | - | - | - |`)
      continue
    }
    lines.push(`| ${project.name} | ${checksSummary(compare.webRender)} | ${checksSummary(compare.parity)} | ${checksSummary(compare.weappCss)} | ${compare.styleDiffCount} | ${compare.classDiffCount} | \`${compare.screenshots.web}\`, \`${compare.screenshots.weapp}\` |`)
  }
  lines.push('')
  lines.push('## Commands')
  lines.push('')
  for (const command of report.commands) {
    lines.push(`- ${command.name}: \`${command.command.join(' ')}\` in \`${command.cwd}\` -> ${statusText(command.exitCode)}, ${command.durationMs}ms, log \`${command.logFile}\``)
  }
  lines.push('')
  lines.push('## Final git status')
  lines.push('')
  lines.push('```text')
  lines.push(report.environment.gitStatusAfter.trim() || '(clean)')
  lines.push('```')
  lines.push('')
  const failures = []
  for (const command of report.commands) {
    if (command.exitCode !== 0) {
      failures.push(`${command.name} exit=${command.exitCode}`)
    }
  }
  for (const item of report.hmr.cases) {
    if (item.status !== 'passed') {
      failures.push(`${item.project} HMR failed`)
    }
  }
  for (const [projectName, compare] of Object.entries(report.compare.projects)) {
    if (compare.parity?.failedCount > 0) {
      failures.push(`${projectName} screenshot parity failed`)
    }
  }
  for (const project of report.projects) {
    if (project.artifacts.weapp.cssChecks?.failedCount > 0) {
      failures.push(`${project.name} build weapp CSS checks failed`)
    }
  }
  lines.push('## Failures and notes')
  lines.push('')
  if (failures.length === 0) {
    lines.push('- No failing validation items were found.')
  }
  else {
    for (const failure of failures) {
      lines.push(`- ${failure}`)
    }
  }
  lines.push('- `report.json` contains raw command records, artifact sizes, compare details, and HMR timings.')
  await fs.writeFile(context.readmeFile, `${lines.join('\n')}\n`)
}
