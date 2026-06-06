# Tailwind CSS v3 target: web 与 target: weapp 样式产物对比报告

生成时间：2026-06-06T06:48:33.548Z

## 范围

- 只比较 Tailwind CSS v3 下 `weapp-tailwindcss/generator` 的 `target: web` 和 `target: weapp` 产物。
- web 产物：`artifacts/tailwind-v3-weapp-target-web.css`
- weapp 产物：`artifacts/tailwind-v3-weapp-target-weapp.wxss`
- 样式格式：web 为 CSS，weapp 为 WXSS。
- 候选 class 数量：309
- 覆盖类别数量：13

## 产物统计

| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
weapp-tailwindcss v3 target web | `artifacts/tailwind-v3-weapp-target-web.css` | 38225 | 1640 | 406 | 626 | 312 | media:17, keyframes:2, supports:2, container:1
weapp-tailwindcss v3 target weapp | `artifacts/tailwind-v3-weapp-target-weapp.wxss` | 28204 | 1182 | 341 | 494 | 301 | media:16, keyframes:2, container:1

## web vs weapp 直接差异

| 归一化后完全相同 | bytes Δ | lines Δ | selectors Δ | declarations Δ | unique classes Δ | important declarations Δ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
否 | -10021 | -458 | -65 | -132 | -11 | -2

## 特征差异

- web 独有特征：hasHoverPseudo, hasUniversalSelector, hasButtonSelector
- weapp 独有特征：hasWxssEscapes, hasViewTextPreflight

## 结论

- Tailwind CSS v3 下，`target: web` 与官方 v3 CSS 保持一致；`target: weapp` 会进入小程序兼容转换，主要差异体现在 preflight 标签选择器、任意值类名转义、hover/button/universal 等 Web 选择器处理。
- 两个 target 的差异是目标运行环境差异，不代表 Tailwind class 候选缺失；候选覆盖和 web parity 由 `pnpm e2e:generator-parity` 守卫。

## 读取建议

- 直接打开 `artifacts/tailwind-v3-weapp-target-web.css` 与 `artifacts/tailwind-v3-weapp-target-weapp.wxss` 做逐段 diff。
- 机器读取可用 `summary.json` 的 `versionTargetComparisons` 字段。
