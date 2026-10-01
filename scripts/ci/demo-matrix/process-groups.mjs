import { execa } from 'execa'

export function ownedProcessGroups(table, rootPid) {
  const rows = table.trim().split('\n').map(line => line.trim().split(/\s+/).map(Number))
  const descendants = new Set([rootPid])
  let changed = true
  while (changed) {
    changed = false
    for (const [pid, parent] of rows) {
      if (descendants.has(parent) && !descendants.has(pid)) {
        descendants.add(pid)
        changed = true
      }
    }
  }
  // 只返回由本次进程树拥有的组，不能给继承自调用方的共享组发信号。
  return [...new Set([rootPid, ...rows.filter(([pid, , group]) => descendants.has(pid) && descendants.has(group)).map(([, , group]) => group)])]
}

export async function captureOwnedProcessGroups(rootPid) {
  const result = await execa('ps', ['-A', '-o', 'pid=,ppid=,pgid='])
  return ownedProcessGroups(result.stdout, rootPid)
}
