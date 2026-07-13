const TIMING_PREFIX = '[weapp-tailwindcss:hmr] '

export function parsePluginTimingLine(line) {
  const index = line.indexOf(TIMING_PREFIX)
  if (index === -1) {
    return undefined
  }
  try {
    const payload = JSON.parse(line.slice(index + TIMING_PREFIX.length))
    if (
      typeof payload?.bundler !== 'string'
      || typeof payload?.phase !== 'string'
      || typeof payload?.durationMs !== 'number'
      || !Number.isFinite(payload.durationMs)
    ) {
      return undefined
    }
    return payload
  }
  catch {
    return undefined
  }
}

export function resolvePluginProcessMs(lines) {
  return resolvePluginTimingSample(lines)?.durationMs
}

export function resolvePluginTimingSample(lines) {
  const samples = lines
    .map(parsePluginTimingLine)
    .filter(Boolean)
  const totalSamples = samples.filter(sample => sample.metric === 'total' || sample.phase === 'total')
  const preferredSamples = totalSamples.length > 0
    ? totalSamples
    : samples.filter(sample => sample.phase === 'processAssets' || sample.phase === 'generateBundle')
  if (preferredSamples.length === 0) {
    return undefined
  }
  const selected = preferredSamples.reduce((slowest, sample) => {
    return sample.durationMs > slowest.durationMs ? sample : slowest
  })
  const detailSample = samples
    .filter(sample => sample.bundler === selected.bundler && (sample.phase === 'generateBundle' || sample.phase === 'processAssets'))
    .reduce((slowest, sample) => !slowest || sample.durationMs > slowest.durationMs ? sample : slowest, undefined)
  return {
    ...selected,
    ...(detailSample && detailSample !== selected ? { details: detailSample } : {}),
  }
}
