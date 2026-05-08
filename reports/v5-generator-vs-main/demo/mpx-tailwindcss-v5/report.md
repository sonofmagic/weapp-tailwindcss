# demo/mpx-tailwindcss-v5 核心产物对比报告

## 结论

- 产物状态：当前新增。
- 兼容性判断：新增项目：main 无对应项目，不能作为 v4 兼容性等价判断，只能作为 v5 质量样本。
- 样式质量判断：v5 CSS 原始体积增加 15.1 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。`!important` 数量增加，需确认是否符合期望的优先级策略。CSS 变量输出增加，通常有利于主题能力，但也要确认小程序端兼容。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 26 | 0 | 26 |
| 原始总体积 | 1.25 MiB | 0 B | +1.25 MiB |
| CSS 文件 | 4 | 0 | 4 |
| CSS 原始体积 | 15.1 KiB | 0 B | +15.1 KiB |
| JS 文件 | 6 | 0 | 6 |
| 规范化聚合 Hash | d4c2f6105af1 | - | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 166，选择器 191，!important 10，@media 10，@supports 0，@layer 0，CSS 变量 115 | 规则 0，选择器 0，!important 0，@media 0，@supports 0，@layer 0，CSS 变量 0 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 6 | 0 | 6 | 0 |
| SourceMap | 6 | 0 | 6 | 0 |
| 配置/描述 | 6 | 0 | 6 | 0 |
| 样式 | 4 | 0 | 4 | 0 |
| 模板 | 4 | 0 | 4 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 新增 | 脚本 | `dist/wx/app.js` | 14197 / e84399793ab6 | - |
| 新增 | SourceMap | `dist/wx/app.js.map` | 49648 / a6e023f54f77 | - |
| 新增 | 配置/描述 | `dist/wx/app.json` | 251 / 7f34d686b329 | - |
| 新增 | 样式 | `dist/wx/app.wxss` | 37 / da1a99f51ada | - |
| 新增 | 脚本 | `dist/wx/bundle.js` | 172969 / 69d84d381ffd | - |
| 新增 | SourceMap | `dist/wx/bundle.js.map` | 829964 / 4b3968826242 | - |
| 新增 | 脚本 | `dist/wx/components/lista8452db4/index.js` | 871 / d46d976684f7 | - |
| 新增 | SourceMap | `dist/wx/components/lista8452db4/index.js.map` | 2356 / ade3357d263a | - |
| 新增 | 配置/描述 | `dist/wx/components/lista8452db4/index.json` | 18 / 3cac147888c7 | - |
| 新增 | 模板 | `dist/wx/components/lista8452db4/index.wxml` | 119 / 3c6e11f7f64b | - |
| 新增 | 脚本 | `dist/wx/custom-tab-bar/index.js` | 773 / d42eba37f662 | - |
| 新增 | SourceMap | `dist/wx/custom-tab-bar/index.js.map` | 2052 / 71fafde7f85e | - |
| 新增 | 配置/描述 | `dist/wx/custom-tab-bar/index.json` | 18 / 3cac147888c7 | - |
| 新增 | 模板 | `dist/wx/custom-tab-bar/index.wxml` | 64 / 8a2fa1fe7704 | - |
| 新增 | 脚本 | `dist/wx/pages/component/index.js` | 634 / cf3bd5cb5e08 | - |
| 新增 | SourceMap | `dist/wx/pages/component/index.js.map` | 1671 / 0f41d44aaf7f | - |
| 新增 | 配置/描述 | `dist/wx/pages/component/index.json` | 22 / e9855c008134 | - |
| 新增 | 模板 | `dist/wx/pages/component/index.wxml` | 20 / 7b09016cdf20 | - |
| 新增 | 样式 | `dist/wx/pages/component/index.wxss` | 0 / 01ba4719c80b | - |
| 新增 | 脚本 | `dist/wx/pages/index.js` | 35954 / af6f14c8543e | - |
| 新增 | SourceMap | `dist/wx/pages/index.js.map` | 178030 / b1688ade2c5b | - |
| 新增 | 配置/描述 | `dist/wx/pages/index.json` | 61 / cd40394b983c | - |
| 新增 | 模板 | `dist/wx/pages/index.wxml` | 3366 / cd19c6fdc0c3 | - |
| 新增 | 配置/描述 | `dist/wx/project.config.json` | 607 / a0afe8a659db | - |
| 新增 | 样式 | `dist/wx/styles/app5e440dc4.wxss` | 9955 / 96394bbfec1e | - |
| 新增 | 样式 | `dist/wx/styles/index6ff7f9ca.wxss` | 5443 / 25bde8010d7c | - |

