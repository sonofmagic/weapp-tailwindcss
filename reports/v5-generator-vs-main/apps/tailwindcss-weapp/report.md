# apps/tailwindcss-weapp 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积增加 776.0 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。CSS 变量输出增加，通常有利于主题能力，但也要确认小程序端兼容。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 129 | 129 | 0 |
| 原始总体积 | 2.47 MiB | 1.71 MiB | +776.0 KiB |
| CSS 文件 | 23 | 23 | 0 |
| CSS 原始体积 | 1.12 MiB | 367.3 KiB | +776.0 KiB |
| JS 文件 | 37 | 37 | 0 |
| 规范化聚合 Hash | 243aba7f4d28 | 39814a2ed971 | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 10710，选择器 13120，!important 988，@media 15，@supports 0，@layer 0，CSS 变量 9728 | 规则 1608，选择器 2982，!important 988，@media 4，@supports 0，@layer 0，CSS 变量 3604 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 模板 | 8 | 8 | 0 | 0 |
| 样式 | 3 | 3 | 0 | 0 |
| 脚本 | 3 | 3 | 0 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 样式 | `dist/build/mp-weixin/app.wxss` | 911560 / d3dc7ffbe615 | 113236 / 82c27bda256d |
| 变更 | 模板 | `dist/build/mp-weixin/components/BaseLayout.wxml` | 129 / eecb0be36642 | 129 / 8c0425f5bac4 |
| 变更 | 模板 | `dist/build/mp-weixin/components/Navbar.wxml` | 297 / 143a5492d7a8 | 297 / 2c5f81d048a8 |
| 变更 | 模板 | `dist/build/mp-weixin/node-modules/uni-app-mp-html/components/mp-html/mp-html.wxml` | 867 / 34df8cc8d019 | 867 / 033ec0f34221 |
| 变更 | 脚本 | `dist/build/mp-weixin/node-modules/uni-app-mp-html/components/mp-html/node/node.js` | 16485 / 3c62215ab9c2 | 16485 / c30bc122abb6 |
| 变更 | 样式 | `dist/build/mp-weixin/node-modules/uni-app-mp-html/components/mp-html/node/node.wxss` | 6298 / b076ff3ede75 | 6290 / 14bc034cb9af |
| 变更 | 模板 | `dist/build/mp-weixin/node-modules/uview-plus/components/u-collapse/u-collapse.wxml` | 102 / 7faf9c267cac | 102 / 26f2c1d6bef7 |
| 变更 | 模板 | `dist/build/mp-weixin/pages/index/detail.wxml` | 1772 / c4fa4a0bd62e | 1772 / 2e125091980c |
| 变更 | 样式 | `dist/build/mp-weixin/pages/index/detail.wxss` | 9164 / 4b7eab8b7d84 | 12890 / 405e680fd1c9 |
| 变更 | 脚本 | `dist/build/mp-weixin/pages/index/index.js` | 3156 / 40e3a4dfb759 | 3156 / 270383112d0b |
| 变更 | 模板 | `dist/build/mp-weixin/pages/index/index.wxml` | 2937 / 77c13969bd50 | 2937 / de57e067d48e |
| 变更 | 模板 | `dist/build/mp-weixin/pages/theme/code.wxml` | 81 / b79a8b6893fc | 81 / aaefa0faa643 |
| 变更 | 脚本 | `dist/build/mp-weixin/pages/theme/index.js` | 1950 / 6f1879618f58 | 1950 / 364f8b22e17e |
| 变更 | 模板 | `dist/build/mp-weixin/pages/theme/index.wxml` | 1986 / a4886b7d4d9c | 1986 / 280927532e24 |

