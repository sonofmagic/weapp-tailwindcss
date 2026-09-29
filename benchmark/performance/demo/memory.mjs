import { execa } from 'execa'

export function treeRss(rows, rootPid) {
  const children = new Map()
  for (const row of rows) {
    const siblings = children.get(row.ppid) ?? []
    siblings.push(row)
    children.set(row.ppid, siblings)
  }
  const pending = rows.filter(row => row.pid === rootPid)
  const seen = new Set()
  let bytes = 0
  while (pending.length) {
    const row = pending.pop()
    if (seen.has(row.pid)) continue
    seen.add(row.pid)
    bytes += row.bytes
    pending.push(...(children.get(row.pid) ?? []))
  }
  return seen.size ? bytes / 1024 ** 2 : null
}

export async function sampleMemory(pid) {
  if (!pid) return null
  const windows = process.platform === 'win32'
  const result = await execa(windows ? 'powershell' : 'ps', windows
    ? ['-NoProfile', '-Command', 'Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,WorkingSetSize | ConvertTo-Json -Compress']
    : ['-Ao', 'pid=,ppid=,rss='], { reject: false, timeout: 5000, windowsHide: true })
  if (result.exitCode !== 0) return null
  try {
    const rows = windows
      ? JSON.parse(result.stdout).map(row => ({ pid: Number(row.ProcessId), ppid: Number(row.ParentProcessId), bytes: Number(row.WorkingSetSize) }))
      : result.stdout.trim().split(/\r?\n/).map(line => {
          const [pid, ppid, rss] = line.trim().split(/\s+/).map(Number)
          return { pid, ppid, bytes: rss * 1024 }
        })
    return treeRss(rows, pid)
  }
  catch { return null }
}
