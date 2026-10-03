import type { ChildProcess } from 'node:child_process'
import type { ProcessIdentity } from './process-table'
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import { setTimeout as delay } from 'node:timers/promises'
import { collectOwnedProcesses, readProcessTable } from './process-table'

interface CleanupOptions {
  cooperativeMs?: number
  cleanupMs?: number
}

/** 仅清理独立组和已证明身份的后代；未登记的 double-fork 不属于确认范围。 */
export function createWorkflowProcessTree(child: ChildProcess, closed: Promise<unknown>, options: CleanupOptions = {}) {
  let group = process.platform === 'win32' ? undefined : child.pid
  let owned = new Map<number, ProcessIdentity>()
  let initialized = false
  let stopping: Promise<void> | undefined
  let didClose = false
  void closed.then(() => {
    didClose = true
  })
  const capture = (timeoutMs?: number) => {
    if (!child.pid) {
      return new Map<number, ProcessIdentity>()
    }
    const rows = readProcessTable(timeoutMs)
    if (!initialized) {
      const root = rows.find(row => row.pid === child.pid)
      if (root && child.exitCode === null && child.signalCode === null) {
        owned.set(root.pid, root)
      }
      initialized = true
    }
    const current = collectOwnedProcesses(rows, owned, group)
    const groupRows = group ? rows.filter(row => row.group === group && !row.zombie) : []
    if (groupRows.length && ![...current.values()].some(row => row.group === group)) {
      throw new Error(`本轮进程组缺少仍匹配的身份锚，不能重新领取 PGID=${group}；清理范围未确认。`)
    }
    if (!groupRows.length) {
      group = undefined
    }
    owned = current
    return current
  }
  const stop = async (cooperative: boolean) => {
    if (!child.pid) {
      return
    }
    const errors: unknown[] = []
    const signals = new Set<NodeJS.Signals>()
    let current = owned
    const read = (remaining: number) => {
      try {
        current = capture(remaining)
        return true
      }
      catch (error) {
        errors.push(error)
        return false
      }
    }
    const cooperativeDeadline = Date.now() + (cooperative ? options.cooperativeMs ?? 30_000 : 0)
    while (Date.now() < cooperativeDeadline) {
      if (!read(Math.min(5000, cooperativeDeadline - Date.now()))) {
        break
      }
      if (didClose && current.size === 0) {
        break
      }
      await delay(Math.min(100, Math.max(1, cooperativeDeadline - Date.now())))
    }
    const deadline = Date.now() + (options.cleanupMs ?? 2000)
    const remaining = () => Math.max(1, deadline - Date.now())
    const signal = (value: NodeJS.Signals) => {
      if (!read(remaining()) && !didClose && child.exitCode === null && child.signalCode === null) {
        // 即使进程表不可用，仍可停止本次 spawn 的本体；其余归属失败照实上报。
        try {
          if (!child.kill(value)) {
            throw new Error(`本轮子进程 pid=${child.pid} 未接受 ${value}`)
          }
          signals.add(value)
        }
        catch (error) {
          errors.push(error)
        }
        return
      }
      for (const row of [...current.values()].reverse()) {
        if (Date.now() >= deadline) {
          break
        }
        try {
          const latest = readProcessTable(remaining()).find(item => item.pid === row.pid && item.started === row.started && !item.zombie)
          if (!latest) {
            continue
          }
          signals.add(value)
          if (process.platform === 'win32') {
            // 每个 PID 均已核对出生时间；禁止 /t 再按可能复用的历史 PPID 扩大范围。
            const result = spawnSync('taskkill', ['/pid', String(row.pid), '/f'], { encoding: 'utf8', timeout: remaining(), windowsHide: true })
            if (result.error || result.status !== 0) {
              if (readProcessTable(remaining()).some(item => item.pid === row.pid && item.started === row.started && !item.zombie)) {
                throw new Error(`taskkill pid=${row.pid} 失败：${result.error?.message ?? result.stderr}`, { cause: result.error })
              }
            }
          }
          else {
            process.kill(row.pid, value)
          }
        }
        catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ESRCH') {
            errors.push(error)
          }
        }
      }
    }
    const graceDeadline = Date.now() + Math.floor((options.cleanupMs ?? 2000) / 2)
    for (const value of ['SIGTERM', 'SIGKILL'] as const) {
      signal(value)
      const until = value === 'SIGTERM' ? graceDeadline : deadline
      do {
        const verified = read(remaining())
        if (didClose && verified && current.size === 0) {
          if (signals.size) {
            errors.push(new Error(`本轮已确认身份的进程通过 ${[...signals].join('/')} 终止；正常清理与源码恢复未确认。`))
          }
          if (errors.length) {
            throw new AggregateError(errors, '阶段子进程清理未正常完成。')
          }
          return
        }
        if (Date.now() >= until) {
          break
        }
        await delay(Math.min(25, until - Date.now()))
      } while (Date.now() < until)
    }
    throw new AggregateError(errors, `阶段子进程有界清理未成功；close=${didClose}，仍记录 PID=${[...current.keys()].join(',')}；清理范围与源码恢复未确认。`)
  }
  return {
    capture,
    stop(cooperative = false) {
      stopping ??= stop(cooperative)
      return stopping
    },
  }
}
