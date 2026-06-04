# apps/vite-native-ts-skyline 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积减少 19 B，有体积收益，但需要确认没有缺失 v4 已覆盖样式。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 16 | 16 | 0 |
| 原始总体积 | 226.4 KiB | 227.0 KiB | -549 B |
| CSS 文件 | 3 | 3 | 0 |
| CSS 原始体积 | 24.1 KiB | 24.1 KiB | -19 B |
| JS 文件 | 6 | 6 | 0 |
| 规范化聚合 Hash | b6ecb0189f2d | fbfb43cdb63c | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 260，选择器 267，!important 0，@media 0，@supports 0，@layer 0，CSS 变量 127 | 规则 256，选择器 263，!important 0，@media 0，@supports 0，@layer 0，CSS 变量 127 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 8 | 4 | 2 | 2 |
| 样式 | 1 | 1 | 0 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 脚本 | `dist/app.js` | 392 / 49b8dc48a8bf | 405 / b0ac96eb2dcd |
| 变更 | 样式 | `dist/app.wxss` | 24516 / 8e553cc8234c | 24535 / 841329eece1e |
| 变更 | 脚本 | `dist/components/skyline-navbar/index.js` | 2615 / 526a0e66487d | 2628 / 9aac0915fec1 |
| 变更 | 脚本 | `dist/pages/cart/index.js` | 14475 / b317d507bb5b | 14479 / f55854bd61c5 |
| 变更 | 脚本 | `dist/pages/index/index.js` | 3613 / cf276ab66e5f | 3626 / de161c05d6d1 |
| 新增 | 脚本 | `dist/src-BF-e4_0K.js` | 115565 / 6f5e4d8d1ba4 | - |
| 新增 | 脚本 | `dist/weapp-vendors/wevu-ref.js` | 53969 / 2b35ba0e746f | - |
| 删除 | 脚本 | `dist/weapp-vendors/wevu-router.js` | - | 52066 / 74d0e8cb65d8 |
| 删除 | 脚本 | `dist/weapp-vendors/wevu-src.js` | - | 117955 / 5957dab98675 |

