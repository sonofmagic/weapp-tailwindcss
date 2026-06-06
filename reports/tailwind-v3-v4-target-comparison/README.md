# Tailwind CSS v3/v4 与 weapp-tailwindcss target 输出对比报告

生成时间：2026-06-06T06:35:49.665Z

## 环境

- weapp-tailwindcss: 5.0.2
- Tailwind CSS v3: 3.4.19
- Tailwind CSS v4: 4.3.0
- 生成方式：同一组 class 候选分别输入官方 Tailwind CSS 与 `weapp-tailwindcss/generator`。
- 对比目标：官方 Tailwind CSS、`weapp-tailwindcss target: web`、`weapp-tailwindcss target: weapp`。

## 素材

- HTML fixture: `fixture.html`
- Tailwind v3 CSS fixture: `fixture-tailwind-v3.css`
- Tailwind v4 CSS fixture: `fixture-tailwind-v4.css`
- 候选 class 数量：309
- 覆盖类别数量：13

覆盖点：preflight、container、flex/grid、spacing、size、`rpx` 任意值、`rounded-full`、border/color、background url、typography、shadow、opacity、hover/active、before/after content、responsive media。

### 覆盖类别

- coreLayout: 23 个
- displayAndBox: 23 个
- flexGrid: 25 个
- spacingAndSizing: 30 个
- typography: 29 个
- visual: 31 个
- colorsAndBackgrounds: 23 个
- effectsAndTransforms: 26 个
- tablesListsSvgAndForms: 23 个
- stateVariants: 25 个
- structuralAndRelationVariants: 17 个
- environmentVariants: 21 个
- modifiersAndArbitrarySyntax: 13 个

## 产物清单

产物全部保留在 `artifacts/` 目录。

| 产物 | 文件 | bytes | lines | selectors | declarations | unique classes | at-rules |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
Tailwind CSS v3 官方输出 | `artifacts/tailwind-v3-official.css` | 38225 | 1640 | 406 | 626 | 312 | media:17, keyframes:2, supports:2, container:1
weapp-tailwindcss v3 target web | `artifacts/tailwind-v3-weapp-target-web.css` | 38225 | 1640 | 406 | 626 | 312 | media:17, keyframes:2, supports:2, container:1
weapp-tailwindcss v3 target weapp | `artifacts/tailwind-v3-weapp-target-weapp.wxss` | 28204 | 1182 | 341 | 494 | 301 | media:16, keyframes:2, container:1
Tailwind CSS v4 官方输出 | `artifacts/tailwind-v4-official.css` | 46251 | 1838 | 452 | 798 | 311 | layer:6, supports:7, media:22, container:1, property:74, keyframes:2
weapp-tailwindcss v4 target web | `artifacts/tailwind-v4-weapp-target-web.css` | 46251 | 1838 | 452 | 798 | 311 | layer:6, supports:7, media:22, container:1, property:74, keyframes:2
weapp-tailwindcss v4 target weapp | `artifacts/tailwind-v4-weapp-target-weapp.wxss` | 34130 | 1243 | 343 | 564 | 302 | media:16, container:1, keyframes:2

## 直接对比

| 对比项 | 归一化后完全相同 | bytes Δ | selectors Δ | declarations Δ | 左侧独有特征 | 右侧独有特征 |
| --- | --- | ---: | ---: | ---: | --- | --- |
v3 官方 Tailwind CSS vs weapp target web | 是 | 0 | 0 | 0 | - | -
v3 官方 Tailwind CSS vs weapp target weapp | 否 | -10021 | -65 | -132 | hasHoverPseudo, hasUniversalSelector, hasButtonSelector | hasWxssEscapes, hasViewTextPreflight
v4 官方 Tailwind CSS vs weapp target web | 是 | 0 | 0 | 0 | - | -
v4 官方 Tailwind CSS vs weapp target weapp | 否 | -12121 | -109 | -234 | hasAtProperty, hasLayer, hasHoverPseudo, hasUniversalSelector, hasButtonSelector | hasWxssEscapes, hasViewTextPreflight, hasWeappRootScope
官方 Tailwind CSS v3 vs v4 | 否 | 8026 | 46 | 172 | - | hasTailwindV4ThemeVariables, hasAtProperty, hasLayer
weapp target weapp v3 vs v4 | 否 | 5926 | 2 | 70 | - | hasTailwindV4ThemeVariables, hasWeappRootScope

## 关键结论

1. Tailwind v3 下，`target: web` 与官方 Tailwind CSS 归一化后完全一致；`target: weapp` 会进入小程序 CSS 转换，输出 `artifacts/tailwind-v3-weapp-target-weapp.wxss`。
2. Tailwind v4 下，`target: web` 与官方 Tailwind CSS 归一化后完全一致；`target: weapp` 会过滤/转换小程序不支持的 CSS 形态，输出 `artifacts/tailwind-v4-weapp-target-weapp.wxss`。
3. v4 官方输出比 v3 官方输出包含 Tailwind v4 主题变量与现代 CSS 层结构；v3 官方输出更接近传统 preflight 与工具类展开。
4. weapp target weapp 的共同特征是选择器和任意值 class 被小程序安全转义，例如 `w-[123px]` 会转成可在 WXSS 中使用的类名；同时保留 `h-[48rpx]` 的 rpx 输出。
5. `rounded-full` 在官方 Tailwind v3 中输出 `9999px`，在官方 Tailwind v4 中输出 `calc(infinity * 1px)`；weapp target weapp 会把 v4 的 infinity 形态降为小程序可接受的 `9999px`。
6. v4 weapp 输出会额外体现 v4 运行时需要的 root/theme 变量作用域，检测结果 hasWeappRootScope=true；v3 weapp 主要体现 `view,text` preflight 转换，检测结果 hasViewTextPreflight=true。

## 关键差异索引

- `artifacts/tailwind-v3-official.css` 与 `artifacts/tailwind-v3-weapp-target-web.css`：内容完全一致，可作为 v3 web parity 基线。
- `artifacts/tailwind-v4-official.css` 与 `artifacts/tailwind-v4-weapp-target-web.css`：内容完全一致，可作为 v4 web parity 基线。
- `artifacts/tailwind-v3-weapp-target-weapp.wxss`：关注 `view,text,::before,::after` preflight、`w-_b123px_B`、`h-_b48rpx_B`、`before_ccontent-*`、`rounded-full`。
- `artifacts/tailwind-v4-weapp-target-weapp.wxss`：关注 `page,.tw-root,wx-root-portal-content,:host` 变量作用域、被移除的 `@property/@layer`、`rounded-full` 的 `9999px` 降级。
- `artifacts/tailwind-v4-official.css`：关注 v4 的 `@property`、嵌套选择器、`calc(infinity * 1px)` 与主题变量。

## 读取建议

- 先看 `summary.json` 获取统计矩阵。
- 对类名和选择器转义，直接对比 `tailwind-v*-official.css` 与 `tailwind-v*-weapp-target-weapp.wxss`。
- 对 web parity，直接对比 `tailwind-v*-official.css` 与 `tailwind-v*-weapp-target-web.css`。
