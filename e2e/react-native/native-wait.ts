export interface NativeWaitState {
  bundleCompletedAt?: number
  now: number
  recovered: boolean
  recoveryDelay: number
  reportTimeout: number
  runCompletedAt?: number
  startedAt: number
  startupTimeout: number
}

export function evaluateNativeWait(state: NativeWaitState) {
  const phase = state.runCompletedAt ? 'runtime report' : 'native build and launch'
  const phaseStartedAt = state.runCompletedAt ?? state.startedAt
  const phaseTimeout = state.runCompletedAt ? state.reportTimeout : state.startupTimeout
  return {
    phase,
    shouldRecover: Boolean(
      state.runCompletedAt
      && !state.recovered
      && !state.bundleCompletedAt
      && state.now - state.runCompletedAt >= state.recoveryDelay,
    ),
    timedOut: state.now - phaseStartedAt >= phaseTimeout,
  }
}
