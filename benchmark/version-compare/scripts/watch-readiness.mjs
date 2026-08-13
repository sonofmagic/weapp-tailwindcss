const defaultReadyLogRE = /compiled successfully|built in [\d.]+m?s?|Build complete|Watching for changes|ready in \d+/i

function matchesReadyLog(line, watchReadyLog) {
  if (typeof watchReadyLog === 'string') {
    return line.includes(watchReadyLog)
  }
  if (watchReadyLog instanceof RegExp) {
    watchReadyLog.lastIndex = 0
    return watchReadyLog.test(line)
  }
  return defaultReadyLogRE.test(line)
}

export function isWatchReady({
  logs,
  outputExists,
  outputMtime,
  initialOutputMtime,
  outputHasContent,
  watchReadyLog,
}) {
  if (!outputExists || !outputHasContent) {
    return false
  }

  if (watchReadyLog !== undefined) {
    return logs.some(line => matchesReadyLog(line, watchReadyLog))
  }

  return outputMtime > initialOutputMtime || logs.some(line => matchesReadyLog(line))
}
