import process from 'node:process'

export interface HmrTimingDetails {
  emit?: boolean
  file?: string
  hooks?: Record<string, HmrTimingHookSummary>
  metric?: 'hook' | 'total'
  memoryDebug?: Record<string, unknown> | undefined
  wallMs?: number
}

export interface HmrTimingHookSummary {
  count: number
  durationMs: number
  maxMs: number
}

type HmrTimingBundler = 'vite' | 'webpack' | 'gulp'

interface HmrTimingSession {
  hooks: Record<string, HmrTimingHookSummary>
  startedAt?: number
  totalMs: number
}

export interface HmrTimingRecorder {
  emitTotal: (phase?: string) => void
  measure: <T>(phase: string, task: () => T | Promise<T>, details?: HmrTimingDetails) => Promise<T>
  record: (phase: string, durationMs: number, details?: HmrTimingDetails) => void
}

export function shouldEmitHmrTiming() {
  return process.env['WEAPP_TW_WATCH_REGRESSION'] === '1'
    || process.env['WEAPP_TW_HMR_TIMING'] === '1'
}

function shouldEmitHumanReadableTiming() {
  return process.env['WEAPP_TW_HMR_TIMING'] === '1'
    && process.env['WEAPP_TW_HMR_TIMING_LOG'] !== '0'
}

export function emitHmrTiming(
  bundler: HmrTimingBundler,
  phase: string,
  durationMs: number,
  details: HmrTimingDetails = {},
) {
  if (!shouldEmitHmrTiming()) {
    return
  }

  const serializableDetails = { ...details }
  delete serializableDetails.emit
  const payload = {
    bundler,
    phase,
    durationMs: Math.max(0, Math.round(durationMs)),
    ...serializableDetails,
    ...(typeof details.wallMs === 'number' ? { wallMs: Math.max(0, Math.round(details.wallMs)) } : {}),
  }
  process.stdout.write(`[weapp-tailwindcss:hmr] ${JSON.stringify(payload)}\n`)
  if (shouldEmitHumanReadableTiming()) {
    const fileSuffix = details.file ? ` file=${details.file}` : ''
    if (details.metric === 'total') {
      const hooks = details.hooks
        ? Object.entries(details.hooks)
            .map(([hook, summary]) => `${hook}=${Math.max(0, Math.round(summary.durationMs))}ms/${summary.count}`)
            .join(', ')
        : ''
      const hookSuffix = hooks ? ` (${hooks})` : ''
      const wallSuffix = typeof payload.wallMs === 'number' ? ` wall=${payload.wallMs}ms` : ''
      process.stdout.write(`[weapp-tailwindcss] ${bundler}:weapp-tailwindcss 总耗时 ${payload.durationMs}ms${wallSuffix}${hookSuffix}\n`)
      return
    }
    process.stdout.write(`[weapp-tailwindcss] ${bundler}:${phase} 耗时 ${payload.durationMs}ms${fileSuffix}\n`)
  }
}

export function createHmrTimingRecorder(bundler: HmrTimingBundler): HmrTimingRecorder {
  const session: HmrTimingSession = {
    hooks: {},
    totalMs: 0,
  }

  const record = (phase: string, durationMs: number, details: HmrTimingDetails = {}) => {
    const roundedDuration = Math.max(0, Math.round(durationMs))
    if (session.startedAt === undefined) {
      session.startedAt = performance.now() - Math.max(0, durationMs)
    }
    session.totalMs += Math.max(0, durationMs)
    const current = session.hooks[phase] ?? { count: 0, durationMs: 0, maxMs: 0 }
    current.count += 1
    current.durationMs += roundedDuration
    current.maxMs = Math.max(current.maxMs, roundedDuration)
    session.hooks[phase] = current
    if (details.emit !== false) {
      emitHmrTiming(bundler, phase, durationMs, details)
    }
  }

  const measure = async <T>(phase: string, task: () => T | Promise<T>, details: HmrTimingDetails = {}) => {
    const startedAt = performance.now()
    try {
      return await task()
    }
    finally {
      record(phase, performance.now() - startedAt, details)
    }
  }

  const emitTotal = (phase = 'total') => {
    if (session.totalMs <= 0) {
      return
    }
    const wallMs = session.startedAt === undefined ? session.totalMs : performance.now() - session.startedAt
    emitHmrTiming(bundler, phase, session.totalMs, {
      hooks: session.hooks,
      metric: 'total',
      wallMs,
    })
    session.hooks = {}
    delete session.startedAt
    session.totalMs = 0
  }

  return {
    emitTotal,
    measure,
    record,
  }
}
