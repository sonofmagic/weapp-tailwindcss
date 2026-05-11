import type { BundleSnapshot } from '../bundle-state'
import { formatDebugFileList } from './metrics'

interface LogBundleProcessPlanOptions {
  debug: (format: string, ...args: unknown[]) => void
  snapshot: BundleSnapshot
  useIncrementalMode: boolean
  iteration: number
}

export function logBundleProcessPlan(options: LogBundleProcessPlanOptions) {
  const {
    debug,
    snapshot,
    useIncrementalMode,
    iteration,
  } = options
  const { processFiles } = snapshot
  if (useIncrementalMode) {
    debug(
      'dirty iteration=%d html=%d[%s] js=%d[%s] css=%d[%s] other=%d[%s]',
      iteration,
      snapshot.changedByType.html.size,
      formatDebugFileList(snapshot.changedByType.html),
      snapshot.changedByType.js.size,
      formatDebugFileList(snapshot.changedByType.js),
      snapshot.changedByType.css.size,
      formatDebugFileList(snapshot.changedByType.css),
      snapshot.changedByType.other.size,
      formatDebugFileList(snapshot.changedByType.other),
    )
    debug(
      'process iteration=%d html=%d[%s] js=%d[%s] css=%d[%s]',
      iteration,
      processFiles.html.size,
      formatDebugFileList(processFiles.html),
      processFiles.js.size,
      formatDebugFileList(processFiles.js),
      processFiles.css.size,
      formatDebugFileList(processFiles.css),
    )
    return
  }

  debug(
    'build mode full process html=%d[%s] js=%d[%s] css=%d[%s]',
    processFiles.html.size,
    formatDebugFileList(processFiles.html),
    processFiles.js.size,
    formatDebugFileList(processFiles.js),
    processFiles.css.size,
    formatDebugFileList(processFiles.css),
  )
}
