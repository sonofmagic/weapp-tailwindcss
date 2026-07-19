import type { CompilerShadowReport } from './shadow-report'

const COMPILER_SHADOW_REPORT_CACHE_MAX = 512

export interface CompilerShadowRunSummary {
  total: number
  matched: number
  mismatched: number
  truncated: number
  dropped: number
}

export interface CompilerShadowRunSnapshot {
  revision: number
  reports: CompilerShadowReport[]
  summary: CompilerShadowRunSummary
}

function cloneSemanticValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(cloneSemanticValue)
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, cloneSemanticValue(entry)]),
    )
  }
  return value
}

function cloneCompilerShadowReport(report: CompilerShadowReport): CompilerShadowReport {
  return {
    file: report.file,
    scopeId: report.scopeId,
    equal: report.equal,
    differences: report.differences.map(difference => ({
      kind: difference.kind,
      path: difference.path,
      ...('left' in difference ? { left: cloneSemanticValue(difference.left) } : {}),
      ...('right' in difference ? { right: cloneSemanticValue(difference.right) } : {}),
    })),
    truncated: report.truncated,
    legacy: { ...report.legacy },
    graph: { ...report.graph },
  }
}

export class CompilerShadowReportSession {
  private readonly reportsByScope = new Map<string, CompilerShadowReport>()
  private revision = 0
  private dropped = 0
  private disposed = false

  constructor(private readonly maxReports = COMPILER_SHADOW_REPORT_CACHE_MAX) {
    if (!Number.isInteger(maxReports) || maxReports <= 0) {
      throw new Error('CompilerShadowReportSession 的 maxReports 必须是正整数。')
    }
  }

  beginRun() {
    this.ensureActive()
    this.revision += 1
    this.reportsByScope.clear()
    this.dropped = 0
    return this.revision
  }

  record(report: CompilerShadowReport, revision = this.revision) {
    this.ensureActive()
    if (revision !== this.revision) {
      return false
    }
    const cloned = cloneCompilerShadowReport(report)
    this.reportsByScope.delete(cloned.scopeId)
    this.reportsByScope.set(cloned.scopeId, cloned)
    while (this.reportsByScope.size > this.maxReports) {
      const oldestScopeId = this.reportsByScope.keys().next().value
      if (oldestScopeId === undefined) {
        break
      }
      this.reportsByScope.delete(oldestScopeId)
      this.dropped += 1
    }
    return true
  }

  getRevision() {
    this.ensureActive()
    return this.revision
  }

  snapshot(): CompilerShadowRunSnapshot {
    this.ensureActive()
    const reports = [...this.reportsByScope.values()]
      .sort((left, right) => left.scopeId.localeCompare(right.scopeId))
      .map(cloneCompilerShadowReport)
    return {
      revision: this.revision,
      reports,
      summary: {
        total: reports.length,
        matched: reports.filter(report => report.equal).length,
        mismatched: reports.filter(report => !report.equal).length,
        truncated: reports.filter(report => report.truncated).length,
        dropped: this.dropped,
      },
    }
  }

  dispose() {
    this.reportsByScope.clear()
    this.dropped = 0
    this.disposed = true
  }

  private ensureActive() {
    if (this.disposed) {
      throw new Error('CompilerShadowReportSession 已释放。')
    }
  }
}

const compilerShadowReportSessions = new WeakMap<object, CompilerShadowReportSession>()

export function getCompilerShadowReportSession(owner: object) {
  let session = compilerShadowReportSessions.get(owner)
  if (!session) {
    session = new CompilerShadowReportSession()
    compilerShadowReportSessions.set(owner, session)
  }
  return session
}

export function beginCompilerShadowRun(owner: object) {
  return getCompilerShadowReportSession(owner).beginRun()
}

export function getCompilerShadowRunRevision(owner: object) {
  return getCompilerShadowReportSession(owner).getRevision()
}

export function recordCompilerShadowReport(
  owner: object,
  report: CompilerShadowReport,
  revision?: number | undefined,
) {
  return getCompilerShadowReportSession(owner).record(report, revision)
}

export function getCompilerShadowRunSnapshot(owner: object) {
  return getCompilerShadowReportSession(owner).snapshot()
}
