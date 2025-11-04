import type { TailwindTokenByFileMap, TailwindTokenReport } from 'tailwindcss-patch'
import { groupTokensByFile } from 'tailwindcss-patch'
import { logger } from '@/logger'

export async function collectTailwindTokens(patcher: unknown): Promise<TailwindTokenReport> {
  const candidate = patcher as { collectContentTokens?: () => Promise<TailwindTokenReport> }
  if (candidate && typeof candidate.collectContentTokens === 'function') {
    return candidate.collectContentTokens()
  }
  throw new Error('The current Tailwind CSS patcher does not support token collection.')
}

export function formatTokenLine(entry: TailwindTokenReport['entries'][number]) {
  return `${entry.relativeFile}:${entry.line}:${entry.column} ${entry.rawCandidate} (${entry.start}-${entry.end})`
}

function formatGroupedPreview(map: TailwindTokenByFileMap, limit = 3) {
  const files = Object.keys(map)
  if (files.length === 0) {
    return { preview: '', moreFiles: 0 }
  }
  const lines = files.slice(0, limit).map((file) => {
    const tokens = map[file]
    const samples = tokens.slice(0, 3).map(token => token.rawCandidate).join(', ')
    const suffix = tokens.length > 3 ? ', ...' : ''
    return `${file}: ${tokens.length} tokens (${samples}${suffix})`
  })
  const moreFiles = files.length > limit ? files.length - limit : 0
  return {
    preview: lines.join('\n'),
    moreFiles,
  }
}

export function logTokenPreview(report: TailwindTokenReport, format: string, groupKey: 'relative' | 'absolute') {
  if (format === 'lines') {
    const preview = report.entries.slice(0, 5).map(formatTokenLine)
    if (preview.length > 0) {
      logger.log('')
      for (const line of preview) {
        logger.info(line)
      }
      if (report.entries.length > 5) {
        logger.info(`...and ${report.entries.length - 5} more.`)
      }
    }
    return
  }

  if (format === 'grouped-json') {
    const grouped = groupTokensByFile(report, {
      key: groupKey,
      stripAbsolutePaths: groupKey !== 'absolute',
    })
    const { preview, moreFiles } = formatGroupedPreview(grouped)
    if (preview) {
      logger.log('')
      logger.info(preview)
      if (moreFiles > 0) {
        logger.info(`...and ${moreFiles} more files.`)
      }
    }
    return
  }

  const previewEntries = report.entries.slice(0, 3)
  if (previewEntries.length > 0) {
    logger.log('')
    logger.info(JSON.stringify(previewEntries, null, 2))
  }
}
