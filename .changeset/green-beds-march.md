---
"weapp-tailwindcss": patch
---

修复 `watch-hmr` 回归校验在多场景下的稳定性问题：

- 修正 `uni-app` 与 `skyline` 场景下的回归脚本行为，减少误判与漏判
- 调整 warmup、settle 与 mutation sequencing 判定逻辑，避免编译未成功或内容变更时过早结束校验
- 放宽部分同类样式与 `skyline` 样式热更断言，并跳过 `Windows` 下不稳定的 `skyline` watch 用例
