---
"weapp-tailwindcss": patch
---

修复 uni-app App 构建中业务字符串被误当作 Tailwind 类名转译的问题。所有构建端的 JavaScript 现在只转译由 Tailwind 生成或验证链路确认的类名；废弃的 `jsArbitraryValueFallback` 不再允许任意值绕过 `classNameSet`，空集合和未命中候选均保持原文。
