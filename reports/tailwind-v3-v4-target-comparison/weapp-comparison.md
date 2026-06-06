# Tailwind CSS v3/v4 target: weapp 样式产物对比报告

生成时间：2026-06-06T06:42:19.812Z

## 范围

- 只比较 `weapp-tailwindcss/generator` 的 `target: weapp` 产物。
- v3 产物：`artifacts/tailwind-v3-weapp-target-weapp.wxss`
- v4 产物：`artifacts/tailwind-v4-weapp-target-weapp.wxss`
- 样式格式：WXSS
- 候选 class 数量：309
- 覆盖类别数量：13

## 产物统计

| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
weapp-tailwindcss v3 target weapp | `artifacts/tailwind-v3-weapp-target-weapp.wxss` | 28204 | 1182 | 341 | 494 | 301 | media:16, keyframes:2, container:1
weapp-tailwindcss v4 target weapp | `artifacts/tailwind-v4-weapp-target-weapp.wxss` | 34130 | 1243 | 343 | 564 | 302 | media:16, container:1, keyframes:2

## v3 vs v4 直接差异

| 归一化后完全相同 | bytes Δ | lines Δ | selectors Δ | declarations Δ | unique classes Δ | important declarations Δ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
否 | 5926 | 61 | 2 | 70 | 1 | 0

## 特征差异

- v3 独有特征：-
- v4 独有特征：hasTailwindV4ThemeVariables, hasWeappRootScope

## 结论

- `target: weapp` 会经过小程序兼容转换，因此 v3/v4 差异同时包含 Tailwind 版本差异和 weapp 目标对选择器、任意值类名、preflight、unsupported at-rules 的转换差异。
- v4 weapp 产物会保留小程序可用的 v4 root/theme 变量作用域，并移除 `@property/@layer` 等小程序不适合直接输出的结构。

## 读取建议

- 直接打开 `artifacts/tailwind-v3-weapp-target-weapp.wxss` 与 `artifacts/tailwind-v4-weapp-target-weapp.wxss` 做逐段 diff。
- 机器读取可用 `summary.json` 的 `targetComparisons` 字段。
