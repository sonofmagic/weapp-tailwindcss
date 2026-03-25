import { stop } from 'esbuild'
import { afterAll } from 'vitest'

afterAll(() => {
  // UI 包的测试会触发 Vite 构建；在进程退出前显式关闭 esbuild service，避免 CI 遗留句柄。
  stop()
})
