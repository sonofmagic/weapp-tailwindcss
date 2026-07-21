import { waitFor } from './text'

export interface WaitForWebCompileSettledOptions {
  ensureRunning: () => void
  getLastCompileSignalAt: () => number
  label: string
  phase: string
  phaseStartedAt: number
  pollMs: number
  timeoutMs: number
  acceptWhen?: () => Promise<boolean>
}

export async function waitForWebCompileSettled(options: WaitForWebCompileSettledOptions) {
  const stableWindowMs = Math.min(Math.max(options.pollMs * 2, 600), 1500)
  return await waitFor(
    async () => {
      options.ensureRunning()
      if (options.acceptWhen && await options.acceptWhen()) {
        return true
      }
      const lastCompileSignalAt = options.getLastCompileSignalAt()
      return lastCompileSignalAt > 0
        && lastCompileSignalAt >= options.phaseStartedAt
        && Date.now() - lastCompileSignalAt >= stableWindowMs
    },
    {
      timeoutMs: options.timeoutMs,
      pollMs: options.pollMs,
      message: `[${options.label}] web ${options.phase} compile did not settle in time`,
    },
    options.phaseStartedAt,
  )
}

export function resolveWebCompileSettleTimeoutMs(timeoutMs: number, configuredTimeoutMs?: number) {
  if (configuredTimeoutMs != null) {
    return Math.min(timeoutMs, configuredTimeoutMs)
  }
  if (timeoutMs <= 30_000) {
    return timeoutMs
  }
  return Math.min(Math.max(30_000, Math.ceil(timeoutMs / 4)), 90_000)
}

export function resolveReloadAcceptAttemptTimeout(timeoutMs: number, pollMs: number) {
  return Math.min(timeoutMs, Math.max(pollMs * 100, 5000), 15_000)
}
