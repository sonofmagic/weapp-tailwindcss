# Tailwind CSS v3/v4 target: web 样式产物对比报告

生成时间：2026-06-06T06:48:33.547Z

## 范围

- 只比较 `weapp-tailwindcss/generator` 的 `target: web` 产物。
- v3 产物：`artifacts/tailwind-v3-weapp-target-web.css`
- v4 产物：`artifacts/tailwind-v4-weapp-target-web.css`
- 样式格式：CSS
- 候选 class 数量：309
- 覆盖类别数量：13

## 产物统计

| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
weapp-tailwindcss v3 target web | `artifacts/tailwind-v3-weapp-target-web.css` | 38225 | 1640 | 406 | 626 | 312 | media:17, keyframes:2, supports:2, container:1
weapp-tailwindcss v4 target web | `artifacts/tailwind-v4-weapp-target-web.css` | 46251 | 1838 | 452 | 798 | 311 | layer:6, supports:7, media:22, container:1, property:74, keyframes:2

## v3 vs v4 直接差异

| 归一化后完全相同 | bytes Δ | lines Δ | selectors Δ | declarations Δ | unique classes Δ | important declarations Δ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
否 | 8026 | 198 | 46 | 172 | -1 | 0

## 特征差异

- v3 独有特征：-
- v4 独有特征：hasTailwindV4ThemeVariables, hasAtProperty, hasLayer

## 结论

- `target: web` 保留 Tailwind Web CSS 形态，因此 v3/v4 差异主要来自 Tailwind 官方版本自身的输出结构、主题变量、现代 CSS at-rules 和 `rounded-full` 等默认值变化。
- 本报告不比较官方 Tailwind CSS 产物；官方 parity 仍见 `README.md` 与 `summary.json`。

## 读取建议

- 直接打开 `artifacts/tailwind-v3-weapp-target-web.css` 与 `artifacts/tailwind-v4-weapp-target-web.css` 做逐段 diff。
- 机器读取可用 `summary.json` 的 `targetComparisons` 字段。
