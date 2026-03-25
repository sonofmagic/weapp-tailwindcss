---
"weapp-tailwindcss": patch
---

修复 `uni-app x` 组件局部样式中的静态 class 回归问题：

- 修复 `styleIsolationVersion=2` 下普通自定义 scoped class 被错误当成 Tailwind utility 本地化，并生成非法 `@apply` 的问题
- 保持 issue #822 的组件局部 Tailwind 样式注入能力不回退，静态与动态 Tailwind class 仍然会正确进入组件局部样式作用域
- 补充混合 `Tailwind class + scoped custom class` 的 regression fixture 与测试，覆盖 `app-android` 场景
