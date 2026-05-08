# demo/mpx-tailwindcss-v4 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积增加 4.8 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。`!important` 数量增加，需确认是否符合期望的优先级策略。CSS 变量输出增加，通常有利于主题能力，但也要确认小程序端兼容。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 26 | 25 | 1 |
| 原始总体积 | 1.05 MiB | 1.04 MiB | +4.8 KiB |
| CSS 文件 | 4 | 3 | 1 |
| CSS 原始体积 | 13.7 KiB | 8.8 KiB | +4.8 KiB |
| JS 文件 | 6 | 6 | 0 |
| 规范化聚合 Hash | 5ec821a35850 | 40f6f70d2848 | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 158，选择器 183，!important 8，@media 10，@supports 0，@layer 0，CSS 变量 96 | 规则 100，选择器 129，!important 7，@media 3，@supports 1，@layer 0，CSS 变量 66 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 7 | 5 | 1 | 1 |
| SourceMap | 7 | 5 | 1 | 1 |
| 样式 | 4 | 1 | 2 | 1 |
| 配置/描述 | 3 | 1 | 1 | 1 |
| 模板 | 2 | 0 | 1 | 1 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 脚本 | `dist/wx/app.js` | 14199 / c034ecdd4a80 | 14198 / 1c2ffd8ad149 |
| 变更 | SourceMap | `dist/wx/app.js.map` | 49648 / 14e9674f8152 | 49637 / 77fa46ba9615 |
| 变更 | 样式 | `dist/wx/app.wxss` | 37 / 3d14b44a93db | 37 / 9c0008398ff5 |
| 变更 | 脚本 | `dist/wx/bundle.js` | 172969 / dc1dc2ff082b | 172943 / 9b5c7b7e819d |
| 变更 | SourceMap | `dist/wx/bundle.js.map` | 829964 / c6c00563ef11 | 829964 / 35eb45200f08 |
| 删除 | 脚本 | `dist/wx/components/list17ff5079/index.js` | - | 870 / 49f677dbaca8 |
| 删除 | SourceMap | `dist/wx/components/list17ff5079/index.js.map` | - | 2356 / 5554c6e70126 |
| 删除 | 配置/描述 | `dist/wx/components/list17ff5079/index.json` | - | 18 / 3cac147888c7 |
| 删除 | 模板 | `dist/wx/components/list17ff5079/index.wxml` | - | 119 / 3c6e11f7f64b |
| 新增 | 脚本 | `dist/wx/components/list27ad1c25/index.js` | 871 / e9b3487267c3 | - |
| 新增 | SourceMap | `dist/wx/components/list27ad1c25/index.js.map` | 2356 / 874aee726eaf | - |
| 新增 | 配置/描述 | `dist/wx/components/list27ad1c25/index.json` | 18 / 3cac147888c7 | - |
| 新增 | 模板 | `dist/wx/components/list27ad1c25/index.wxml` | 119 / 3c6e11f7f64b | - |
| 变更 | 脚本 | `dist/wx/custom-tab-bar/index.js` | 773 / 586ec0e11434 | 772 / 0cc815bc0522 |
| 变更 | SourceMap | `dist/wx/custom-tab-bar/index.js.map` | 2052 / 6b1c5d9b102f | 2052 / a5d5c270cf9e |
| 变更 | 脚本 | `dist/wx/pages/component/index.js` | 636 / e123c8e90b32 | 636 / 03b68fade015 |
| 变更 | SourceMap | `dist/wx/pages/component/index.js.map` | 1671 / d22e28a8e013 | 1671 / 25d5a2414071 |
| 变更 | 脚本 | `dist/wx/pages/index.js` | 788 / 7e45674c005f | 788 / 9875014bf26f |
| 变更 | SourceMap | `dist/wx/pages/index.js.map` | 2589 / 5e6c9d4bac5b | 2589 / 7365e2734492 |
| 变更 | 配置/描述 | `dist/wx/pages/index.json` | 61 / c226ba97111f | 61 / 9a1d230c155d |
| 新增 | 样式 | `dist/wx/styles/app3b4a1ac6.wxss` | 8473 / cfac9facdfe6 | - |
| 删除 | 样式 | `dist/wx/styles/app6fba04f1.wxss` | - | 9020 / 09fcb5922a49 |
| 新增 | 样式 | `dist/wx/styles/index6ff7f9ca.wxss` | 5470 / 2aefb69dc0d1 | - |

