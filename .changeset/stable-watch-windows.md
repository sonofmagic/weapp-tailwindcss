---
'weapp-tailwindcss': patch
---

修复 Windows 环境下 watch HMR 回归场景的稳定性问题。

- 放宽 Windows E2E Watch 的热更新耗时阈值，避免完整矩阵在 Windows runner 上因正常波动误判失败。
- 扩大 fresh mutation class 的候选生成空间，避免历史 watch class 累积后无法生成新 class。
- 恢复 Windows nightly 完整场景的默认重试能力，降低 runner 抖动对 E2E Watch 的影响。
