---
"weapp-tailwindcss": patch
---

修复 uni-app + Vite/HBuilderX 增量热更新中 template 转译退化导致 `wxml` 回退为未转义类名的问题：

- 调整 `generateBundle` 的 html 增量处理策略：非首轮也会将当前 bundle 内 html 资产纳入处理流程，确保每轮都能命中缓存并回填上次转译结果（`processCachedTask`）。
- 避免仅 script 变更时出现 `wxml` 未转义而 `js/wxss` 已转义的链路不一致问题。
- 补充 Vite bundle 回归测试，覆盖 script-only 连续变更与 `bg-[#0000]` 等 arbitrary value 场景，确保 `wxml/js/wxss` 增量输出始终一致。
