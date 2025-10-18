---
"weapp-tailwindcss": patch
---

修复仅传入 `cssEntries` 时无法自动启用 Tailwind v4 补丁的问题，恢复与显式配置 `tailwindcss.v4.cssEntries` 的等价行为。
