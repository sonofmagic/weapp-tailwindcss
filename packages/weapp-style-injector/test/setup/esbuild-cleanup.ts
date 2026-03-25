import { stop } from 'esbuild'
import { afterAll } from 'vitest'

afterAll(() => {
  // 部分测试会走到 Vite config 解析链路；显式回收 esbuild 资源，避免 release job 卡在测试退出阶段。
  stop()
})
