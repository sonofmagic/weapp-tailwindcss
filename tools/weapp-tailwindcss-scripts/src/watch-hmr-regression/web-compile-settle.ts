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
      return lastCompileSignalAt > options.phaseStartedAt
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

export function resolveReloadAcceptAttemptTimeout(timeoutMs: number, pollMs: number) {
  return Math.min(timeoutMs, Math.max(pollMs * 100, 5000), 15_000)
}
