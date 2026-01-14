import type { WorkspacePatchResult } from './types'
import path from 'node:path'
import { logger } from '@/logger'

export function formatDisplayName(workspaceRoot: string, dir: string, name?: string) {
  const relative = path.relative(workspaceRoot, dir) || '.'
  return name ? `${name} (${relative})` : relative
}

export function summarizeWorkspaceResults(results: WorkspacePatchResult[]) {
  const patched = results.filter(result => result.status === 'patched').length
  const skipped = results.filter(result => result.status === 'skipped').length
  const failed = results.filter(result => result.status === 'failed').length

  logger.info('[workspace] 汇总：已补丁 %d，跳过 %d，失败 %d', patched, skipped, failed)
}
