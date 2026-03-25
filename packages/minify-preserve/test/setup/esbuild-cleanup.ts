import { stop } from 'esbuild'
import { afterAll } from 'vitest'

afterAll(() => {
  // bundler-config 测试直接调用 esbuild.build，结束后统一 stop，避免 service 残留。
  stop()
})
