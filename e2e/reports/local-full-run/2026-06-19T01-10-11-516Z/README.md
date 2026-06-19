# 本机全端测试报告

- generated_at: 2026-06-19T01:13:49.945Z
- repository_root: `/Users/icebreaker/Projects/github/weapp-tailwindcss-codex/tailwindcss-mangle-engine`
- profile: hmr-smoke
- steps: 1
- passed: 1
- failed: 0
- skipped: 0
- peak RSS: 3641MB
- max RSS delta: 2937MB

## 命令与内存

| step | status | samples | peak RSS | RSS delta | max process RSS | peak processes | duration | artifacts | command |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |
| mini-program-hmr-memory | passed | 219 | 3641MB | 2937MB | 2121MB | 15 | 3m38s | `e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/weapp-memory/README.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/weapp-memory/summary.json`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/weapp-memory/projects/mpx-tailwindcss-v4.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/weapp-memory/projects/taro-webpack-react-tailwindcss-v4.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/weapp-memory/projects/taro-webpack-vue3-tailwindcss-v4.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/weapp-memory/projects/uni-app-vite-tailwindcss-v4.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/weapp-memory/projects/weapp-vite-tailwindcss-v4.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-10-12-582Z.json`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-10-12-582Z.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-10-42-347Z.json`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-10-42-347Z.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-11-58-623Z.json`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-11-58-623Z.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-13-14-563Z.json`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-13-14-563Z.md`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-13-34-164Z.json`<br>`e2e/reports/local-full-run/2026-06-19T01-10-11-516Z/hmr/hmr-full-report-2026-06-19T01-13-34-164Z.md` | `pnpm e2e:demo:weapp-memory --stage hmr --out-dir .tmp/local-full-report-weapp-memory` |

## 口径

- 该报告统计本机命令进程树 RSS，不包含已在命令外常驻的 IDE/模拟器进程。
- HMR 细分耗时请看同目录下复制或生成的 HMR report；端到端 HMR 与插件处理耗时是不同口径。
- optional step 失败会保留在报告中，便于说明本机缺少 SDK/设备/IDE 时的覆盖边界。

