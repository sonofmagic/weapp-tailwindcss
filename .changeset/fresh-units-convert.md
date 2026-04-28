---
"@weapp-tailwindcss/postcss": patch
---

将 `unitsToPx` 转换链路切换为基于 `postcss-rule-unit-converter` 的规则转换实现，移除对 `postcss-units-to-px` 的直接运行时依赖。

保留 `unitMap`、`transform`、`transform: false`、`propList`、`selectorBlackList` 等兼容配置行为，并补充对应回归测试，确保多单位转 `px` 的默认输出不变。
