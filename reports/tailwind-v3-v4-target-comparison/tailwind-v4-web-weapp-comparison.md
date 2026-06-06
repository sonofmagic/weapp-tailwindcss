# Tailwind CSS v4 target: web 与 target: weapp 样式产物对比报告

生成时间：2026-06-06T06:48:33.548Z

## 范围

- 只比较 Tailwind CSS v4 下 `weapp-tailwindcss/generator` 的 `target: web` 和 `target: weapp` 产物。
- web 产物：`artifacts/tailwind-v4-weapp-target-web.css`
- weapp 产物：`artifacts/tailwind-v4-weapp-target-weapp.wxss`
- 样式格式：web 为 CSS，weapp 为 WXSS。
- 候选 class 数量：309
- 覆盖类别数量：13

## 产物统计

| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
weapp-tailwindcss v4 target web | `artifacts/tailwind-v4-weapp-target-web.css` | 46251 | 1838 | 452 | 798 | 311 | layer:6, supports:7, media:22, container:1, property:74, keyframes:2
weapp-tailwindcss v4 target weapp | `artifacts/tailwind-v4-weapp-target-weapp.wxss` | 34130 | 1243 | 343 | 564 | 302 | media:16, container:1, keyframes:2

## web vs weapp 直接差异

| 归一化后完全相同 | bytes Δ | lines Δ | selectors Δ | declarations Δ | unique classes Δ | important declarations Δ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
否 | -12121 | -595 | -109 | -234 | -9 | -2

## 特征差异

- web 独有特征：hasAtProperty, hasLayer, hasHoverPseudo, hasUniversalSelector, hasButtonSelector
- weapp 独有特征：hasWxssEscapes, hasViewTextPreflight, hasWeappRootScope

## 结论

- Tailwind CSS v4 下，`target: web` 与官方 v4 CSS 保持一致；`target: weapp` 会移除或转换小程序不适合直接输出的 `@property/@layer` 等现代 CSS 结构，并保留 v4 weapp root/theme 变量作用域。
- 两个 target 的差异是目标运行环境差异，不代表 Tailwind class 候选缺失；候选覆盖和 web parity 由 `pnpm e2e:generator-parity` 守卫。

## 读取建议

- 直接打开 `artifacts/tailwind-v4-weapp-target-web.css` 与 `artifacts/tailwind-v4-weapp-target-weapp.wxss` 做逐段 diff。
- 机器读取可用 `summary.json` 的 `versionTargetComparisons` 字段。
