# demo/uni-app-vue3-vite 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积增加 88.8 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。`!important` 数量增加，需确认是否符合期望的优先级策略。CSS 变量输出增加，通常有利于主题能力，但也要确认小程序端兼容。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 94 | 94 | 0 |
| 原始总体积 | 1.00 MiB | 936.1 KiB | +88.9 KiB |
| CSS 文件 | 11 | 11 | 0 |
| CSS 原始体积 | 478.6 KiB | 389.8 KiB | +88.8 KiB |
| JS 文件 | 32 | 32 | 0 |
| 规范化聚合 Hash | 588ab01071f7 | 2ee5bba4d8fb | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 3637，选择器 5110，!important 1037，@media 91，@supports 0，@layer 0，CSS 变量 3401 | 规则 2383，选择器 3768，!important 1025，@media 5，@supports 0，@layer 0，CSS 变量 3373 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 样式 | 8 | 8 | 0 | 0 |
| 模板 | 5 | 5 | 0 | 0 |
| 脚本 | 1 | 1 | 0 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 样式 | `dist/build/mp-weixin/app.wxss` | 138176 / f846c7f0877c | 124717 / 288f519d4a68 |
| 变更 | 模板 | `dist/build/mp-weixin/moduleA/pages/a.wxml` | 446 / fd582684f3ef | 446 / 25d3407381de |
| 变更 | 样式 | `dist/build/mp-weixin/moduleA/pages/a.wxss` | 51537 / 3513aca7352a | 41720 / 2b52d00f4738 |
| 变更 | 模板 | `dist/build/mp-weixin/moduleA/pages/b.wxml` | 446 / fd582684f3ef | 446 / 25d3407381de |
| 变更 | 样式 | `dist/build/mp-weixin/moduleA/pages/b.wxss` | 51537 / 3513aca7352a | 41720 / 2b52d00f4738 |
| 变更 | 样式 | `dist/build/mp-weixin/moduleA/pages/index.wxss` | 51537 / 3513aca7352a | 41720 / 2b52d00f4738 |
| 变更 | 样式 | `dist/build/mp-weixin/node-modules/uview-plus/components/u-button/u-button.wxss` | 21102 / 95b41445d4df | 21079 / 3fd5df2bbce8 |
| 变更 | 脚本 | `dist/build/mp-weixin/pages/index/index.js` | 4453 / c92ffa65f874 | 4453 / 48ffb8e25072 |
| 变更 | 模板 | `dist/build/mp-weixin/pages/index/index.wxml` | 5793 / 3ce38e9edd84 | 5634 / 67a70d701a2a |
| 变更 | 样式 | `dist/build/mp-weixin/pages/index/index.wxss` | 23324 / 552945b4f13e | 35406 / fed189cf9d75 |
| 变更 | 样式 | `dist/build/mp-weixin/pages/index/peer.wxss` | 52808 / 32e72aa4943a | 17492 / 79bae858c697 |
| 变更 | 模板 | `dist/build/mp-weixin/pages/issue/case55.wxml` | 415 / d3c2d247cbef | 415 / 152a9c4f7251 |
| 变更 | 样式 | `dist/build/mp-weixin/pages/issue/typography.wxss` | 61423 / f80e08ac44f4 | 36671 / cea98443da52 |
| 变更 | 模板 | `dist/build/mp-weixin/subs/demo/pages/index.wxml` | 268 / 43b2b42162f2 | 268 / 87b6eb54f0dc |

