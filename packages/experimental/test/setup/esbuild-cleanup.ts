import { stop } from 'esbuild'
import { afterAll } from 'vitest'

afterAll(async () => {
  // experimental 测试会直接调用 esbuild transform，等待 service 关闭后再让 Vitest 退出。
  await stop()
})
