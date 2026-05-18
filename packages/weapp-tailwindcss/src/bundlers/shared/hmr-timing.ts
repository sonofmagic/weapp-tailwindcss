import process from 'node:process'

export interface HmrTimingDetails {
  file?: string
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
  if (shouldEmitHumanReadableTiming()) {
    const fileSuffix = details.file ? ` file=${details.file}` : ''
    process.stdout.write(`[weapp-tailwindcss] ${bundler}:${phase} 耗时 ${payload.durationMs}ms${fileSuffix}\n`)
  }
}
