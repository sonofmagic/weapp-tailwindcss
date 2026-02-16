---
"weapp-tailwindcss": patch
---

修复 Vite + uni-app 在 HMR 增量阶段的样式回退问题，并增强 watch 热更新回归覆盖：

- 修复 `generateBundle` 的 CSS dirty 跳过逻辑：即使本轮 CSS 原文 hash 未变化，也会通过缓存回填已转译结果，避免 `app.wxss` 在 dev/watch 下回退到未转译内容并与同轮 JS/WXML class 改写失配。
- 新增对应单元测试，覆盖“JS 变化但 CSS 原文不变”场景，确保缓存命中时仍应用 CSS 转译结果。
- 增强 `e2e:watch` 的 same-class-literal HMR 校验：新增全局样式稳定性指标与断言，确保“源码变化但 class literal 不变”时仍能覆盖并检测样式稳定性。
- 对 `mpx` 用例保留兼容策略：该场景仅放宽同字面量变更时的全局样式稳定断言，不影响其余项目的严格校验。
