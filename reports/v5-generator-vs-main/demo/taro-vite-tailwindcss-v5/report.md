# demo/taro-vite-tailwindcss-v5 核心产物对比报告

## 结论

- 产物状态：当前新增。
- 兼容性判断：新增项目：main 无对应项目，不能作为 v4 兼容性等价判断，只能作为 v5 质量样本。
- 样式质量判断：v5 CSS 原始体积增加 26.3 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。`!important` 数量增加，需确认是否符合期望的优先级策略。CSS 变量输出增加，通常有利于主题能力，但也要确认小程序端兼容。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 17 | 0 | 17 |
| 原始总体积 | 345.8 KiB | 0 B | +345.8 KiB |
| CSS 文件 | 3 | 0 | 3 |
| CSS 原始体积 | 26.3 KiB | 0 B | +26.3 KiB |
| JS 文件 | 7 | 0 | 7 |
| 规范化聚合 Hash | c42a1438cd85 | - | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 170，选择器 188，!important 1，@media 7，@supports 0，@layer 0，CSS 变量 137 | 规则 0，选择器 0，!important 0，@media 0，@supports 0，@layer 0，CSS 变量 0 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 7 | 0 | 7 | 0 |
| 配置/描述 | 4 | 0 | 4 | 0 |
| 样式 | 3 | 0 | 3 | 0 |
| 模板 | 3 | 0 | 3 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 新增 | 样式 | `dist/app-origin.wxss` | 26898 / d001a80a6d73 | - |
| 新增 | 脚本 | `dist/app.js` | 524 / d7af441fcc04 | - |
| 新增 | 配置/描述 | `dist/app.json` | 221 / a1053964d5a3 | - |
| 新增 | 样式 | `dist/app.wxss` | 27 / f5c248cb1c70 | - |
| 新增 | 脚本 | `dist/babelHelpers.js` | 6904 / c3ce8790dc78 | - |
| 新增 | 模板 | `dist/base.wxml` | 54402 / d8eb7518d3d5 | - |
| 新增 | 脚本 | `dist/comp.js` | 118 / 532d269b7de0 | - |
| 新增 | 配置/描述 | `dist/comp.json` | 108 / 09ea9846c078 | - |
| 新增 | 模板 | `dist/comp.wxml` | 140 / 10c40acf3671 | - |
| 新增 | 脚本 | `dist/pages/index/index.js` | 4256 / 8379962c65d4 | - |
| 新增 | 配置/描述 | `dist/pages/index/index.json` | 93 / bc514638d148 | - |
| 新增 | 模板 | `dist/pages/index/index.wxml` | 80 / 90041f2c8327 | - |
| 新增 | 样式 | `dist/pages/index/index.wxss` | 43 / a2a5bdc357e8 | - |
| 新增 | 配置/描述 | `dist/project.config.json` | 705 / a01fbfb67e17 | - |
| 新增 | 脚本 | `dist/taro.js` | 226012 / 4afe057a18d2 | - |
| 新增 | 脚本 | `dist/utils.wxs` | 997 / 2eaf2335a9da | - |
| 新增 | 脚本 | `dist/vendors.js` | 32591 / 5418a1062706 | - |

