import type { PatchStatusReport } from 'tailwindcss-patch'
import { logger } from '@/logger'

function formatStatusFilesHint(files?: string[]) {
  if (!files?.length) {
    return ''
  }
  return ` (${files.join(', ')})`
}

export function logPatchStatusReport(report: PatchStatusReport) {
  const applied = report.entries.filter(entry => entry.status === 'applied')
  const pending = report.entries.filter(entry => entry.status === 'not-applied')
  const skipped = report.entries.filter(
    entry => entry.status === 'skipped' || entry.status === 'unsupported',
  )
  const packageLabel = `${report.package.name ?? 'tailwindcss'}@${report.package.version ?? 'unknown'}`
  logger.info(`Patch status for ${packageLabel} (v${report.majorVersion})`)

  if (applied.length) {
    logger.success('Applied:')
    applied.forEach((entry) => {
      logger.success(`  - ${entry.name}${formatStatusFilesHint(entry.files)}`)
    })
  }

  if (pending.length) {
    logger.warn('Needs attention:')
    pending.forEach((entry) => {
      const details = entry.reason ? ` - ${entry.reason}` : ''
      logger.warn(`  - ${entry.name}${formatStatusFilesHint(entry.files)}${details}`)
    })
  }
  else {
    logger.success('All applicable patches are applied.')
  }

  if (skipped.length) {
    logger.info('Skipped:')
    skipped.forEach((entry) => {
      const details = entry.reason ? ` - ${entry.reason}` : ''
      logger.info(`  - ${entry.name}${details}`)
    })
  }
}
