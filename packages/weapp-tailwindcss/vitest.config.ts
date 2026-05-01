import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup/esbuild-cleanup.ts'],
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
      {
        find: '#test',
        replacement: path.resolve(__dirname, './test'),
      },
      {
        find: '@weapp-tailwindcss/reset',
        replacement: path.resolve(__dirname, '../reset/src/index.ts'),
      },
    ],
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    benchmark: {
      include: ['test/**/*.bench.ts'],
      outputJson: 'benchmark/bench-report.json',
    },
    coverage: {
      enabled: true,
      exclude: [
        // 测试辅助代码由测试自身覆盖，不计入生产代码覆盖率门禁。
        'test/**',
        'packages/weapp-tailwindcss/test/**',
        // 开发态 watch 回归脚本不属于对外运行时代码，避免拉低 project coverage 门禁。
        'scripts/watch-hmr-regression/**',
        'packages/weapp-tailwindcss/scripts/watch-hmr-regression/**',
      ],
      // reportsDirectory: 'coverage/vitest'
    },
    testTimeout: 60_000,
    globals: true,
    forceRerunTriggers: ['**\/{vitest,vite}.config.*\/**'],
    // ...
  },
  server: {
    watch: {
      ignored: ['**\/package.json/**'],
    },
  },
})
