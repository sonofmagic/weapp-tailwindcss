---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

提升热更新链路的稳定性与性能，并补齐真实 watch 回归保障：

- 优化运行时类名转译策略，修复 stale runtimeSet 场景下新增任意值类与小数类（如 `text-[23.43px]`、`space-y-2.5`）在 JS/WXML/Vue 中的漏转译问题。
- 提炼并复用类名候选判定逻辑，减少重复实现，降低后续维护成本。
- 增强 demo 级 watch 回归脚本（taro + uni-app），覆盖新增类热更新、输出变更检测与恢复校验。
- 为 watch 回归增加本地构建预热与日志降噪能力（可选 `--quiet-sass`），减少无效噪音并提升排查效率。
- 优化相关缓存与增量处理路径，缩短常见热更新阶段插件处理耗时。
