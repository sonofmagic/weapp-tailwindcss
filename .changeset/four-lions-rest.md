---
"weapp-tailwindcss": patch
---

修复 TailwindCSS v4 场景下动态 class 任意值（如 `gap-[20px]`）在 JS 产物中未稳定转译的问题：
- 增加对 `classNameSet` 转义等价类名的命中能力；
- 在严格 class 语义上下文中提供受控的 arbitrary value fallback（仅在 v4 + runtimeSet 异常时自动启用）；
- 统一在不同 bundler 与 cwd 组合下透传 Tailwind 主版本与运行时集合，提升构建稳定性。
