import process from 'node:process'

export interface HmrTimingDetails {
  file?: string
}

export function shouldEmitHmrTiming() {
  return process.env.WEAPP_TW_WATCH_REGRESSION === '1'
    || process.env.WEAPP_TW_HMR_TIMING === '1'
}

export function emitHmrTiming(
  bundler: 'vite' | 'webpack' | 'gulp',
  phase: string,
  durationMs: number,
  details: HmrTimingDetails = {},
) {
  if (!shouldEmitHmrTiming()) {
    return
  }

  const payload = {
    bundler,
    phase,
    durationMs: Math.max(0, Math.round(durationMs)),
    ...details,
  }
  process.stdout.write(`[weapp-tailwindcss:hmr] ${JSON.stringify(payload)}\n`)
}
