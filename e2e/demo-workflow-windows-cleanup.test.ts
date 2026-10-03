import type { ChildProcess } from 'node:child_process'
import { EventEmitter } from 'node:events'
import process from 'node:process'
import { afterEach, expect, it, vi } from 'vitest'
import * as table from '../scripts/demo-e2e-workflow/process-table'
import { createWorkflowProcessTree } from '../scripts/demo-e2e-workflow/process-tree'

const mocks = vi.hoisted(() => ({ spawnSync: vi.fn() }))
vi.mock('node:child_process', () => ({ spawnSync: mocks.spawnSync }))
const platform = process.platform
afterEach(() => {
  Object.defineProperty(process, 'platform', { value: platform })
  vi.restoreAllMocks()
})

it('Windows 只终止再次核对身份的 PID，既不 /t 扩散也不触碰复用 PID', async () => {
  Object.defineProperty(process, 'platform', { value: 'win32' })
  const root = { pid: 100, parent: 1, group: 0, started: '2026-10-04T12:00:10Z' }
  const childRow = { pid: 200, parent: 100, group: 0, started: '2026-10-04T12:00:11Z' }
  let rows = [root, childRow]
  vi.spyOn(table, 'readProcessTable').mockImplementation(() => rows)
  const child = Object.assign(new EventEmitter(), { pid: 100, exitCode: null, signalCode: null }) as ChildProcess
  let finish!: () => void
  const closed = new Promise<void>((resolve) => {
    finish = resolve
  })
  const tree = createWorkflowProcessTree(child, closed)
  tree.capture()
  rows = [root, { ...childRow, parent: 1, started: '2026-10-04T12:00:20Z' }]
  mocks.spawnSync.mockImplementation(() => {
    rows = rows.filter(row => row.pid !== 100)
    Object.assign(child, { exitCode: 0 })
    finish()
    return { status: 0 }
  })
  await expect(tree.stop()).rejects.toThrow('清理未正常完成')
  expect(mocks.spawnSync).toHaveBeenCalledOnce()
  expect(mocks.spawnSync.mock.calls[0]?.slice(0, 2)).toEqual(['taskkill', ['/pid', '100', '/f']])
  expect(mocks.spawnSync.mock.calls[0]?.[2].timeout).toBeLessThanOrEqual(2000)
  expect(rows).toEqual([{ ...childRow, parent: 1, started: '2026-10-04T12:00:20Z' }])
})
