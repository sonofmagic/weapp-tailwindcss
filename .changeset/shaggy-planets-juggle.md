---
"weapp-tailwindcss": patch
---

新增一条专门面向热更新的 e2e 回归链路（构建产物快照链路之外），用于真实验证 taro/uni-app 在 watch 模式下的 HMR 生效性与耗时：

- 新增 `e2e:watch` 系列命令与独立 vitest 配置，支持按 `taro` / `uni` / `both` 运行。
- 强化 `test:watch-hmr` 回归脚本：输出结构化报告（含 hot update / rollback 延迟）、支持性能预算断言与日志降噪。
- 在回归中注入更复杂的 Tailwind 类名组合（含任意值、小数、`calc()`、`grid-cols-[...]`、`/` 透明度、伪元素变体等），确保新增类在 JS/WXML 场景的转译结果可验证。
- 增加“类名避撞”策略，避免测试注入类与 demo 现有类冲突导致误判，提升回归稳定性与可重复性。
- 默认 watch e2e 启用 `--skip-build` 聚焦热更新链路，另提供完整预构建模式命令用于全链路对照。
