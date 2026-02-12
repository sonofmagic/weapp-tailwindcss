---
"weapp-tailwindcss": minor
---

增强 `weapp-tailwindcss` 在复杂 Tailwind 语法与热更新回归场景下的稳定性与可观测性：

- 扩展 watch HMR 回归到双轮次对比（`baseline-arbitrary` 与 `complex-corpus`），并在报告中输出分轮次指标与差异对比，便于长期性能追踪。
- 强化跨框架 watch 路径下的复杂类名热更新验证，覆盖更多任意值、复杂变体与组合语法。
- 补充复杂语法语料与端到端样式产物回归测试，提升对 Tailwind 复杂写法转译行为的覆盖度与回归保障。
