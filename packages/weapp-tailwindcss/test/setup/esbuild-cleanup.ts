import { stop } from 'esbuild'
import { afterAll } from 'vitest'

afterAll(() => {
  // Vite 构建测试会启动 esbuild service；在 CI 中显式停止，避免遗留子进程阻塞 Vitest 退出。
  stop()
})
