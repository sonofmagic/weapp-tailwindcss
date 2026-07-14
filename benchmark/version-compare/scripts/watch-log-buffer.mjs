export function createWatchLogBuffer(limit = 600) {
  const lines = []
  let roundLines

  const collect = (buf) => {
    const text = buf.toString('utf8')
    for (const line of text.split(/\r?\n/)) {
      if (!line) {
        continue
      }
      lines.push(line)
      if (lines.length > limit) {
        lines.shift()
      }
      roundLines?.push(line)
    }
  }

  const beginRound = () => {
    const current = []
    roundLines = current
    return {
      lines: current,
      close() {
        if (roundLines === current) {
          roundLines = undefined
        }
      },
    }
  }

  return {
    beginRound,
    collect,
    lines,
  }
}
