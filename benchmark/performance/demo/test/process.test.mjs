import { expect, it } from 'vitest'
import { run, startProcess } from '../process.mjs'

it('超时会结束被测进程，并保留失败原因', async () => {
  await expect(run(process.execPath, ['-e', 'setInterval(()=>{},100)'], { timeout: 100 })).rejects.toThrow('超时')
}, 10000)
it('找不到命令正常失败，不产生未处理拒绝', async () => {
  await expect(run('weapp-demo-cost-command-does-not-exist', [], { timeout: 1000 })).rejects.toThrow()
})
it('重复停止同一个 watcher 等待同一个清理过程', async () => {
  const session = startProcess(process.execPath, ['-e', 'setInterval(()=>{},100)'])
  await Promise.all([session.stop(), session.stop()])
  expect(() => session.ensureRunning()).toThrow()
})
