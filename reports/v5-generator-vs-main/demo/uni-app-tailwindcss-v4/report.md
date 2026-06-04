# demo/uni-app-tailwindcss-v4 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积增加 22.0 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。CSS 变量输出增加，通常有利于主题能力，但也要确认小程序端兼容。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 22 | 22 | 0 |
| 原始总体积 | 165.8 KiB | 143.8 KiB | +22.0 KiB |
| CSS 文件 | 3 | 3 | 0 |
| CSS 原始体积 | 54.2 KiB | 32.1 KiB | +22.0 KiB |
| JS 文件 | 8 | 8 | 0 |
| 规范化聚合 Hash | df73b7c6fa60 | 0bfc7bfd8696 | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 409，选择器 460，!important 1，@media 20，@supports 0，@layer 0，CSS 变量 189 | 规则 287，选择器 378，!important 1，@media 18，@supports 5，@layer 0，CSS 变量 184 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 样式 | 3 | 3 | 0 | 0 |
| 脚本 | 1 | 1 | 0 | 0 |
| 模板 | 1 | 1 | 0 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 样式 | `dist/build/mp-weixin/app.wxss` | 54461 / 349112554854 | 7465 / 3306db728102 |
| 变更 | 脚本 | `dist/build/mp-weixin/common/vendor.js` | 102541 / f6d16d199a82 | 102539 / 21147d1bb416 |
| 变更 | 样式 | `dist/build/mp-weixin/pages-order/pages/home/home.wxss` | 499 / 8c347d88b5b1 | 12724 / 5657a478b4b5 |
| 变更 | 样式 | `dist/build/mp-weixin/pages-order/pages/user/user.wxss` | 499 / 8c347d88b5b1 | 12724 / 5657a478b4b5 |
| 变更 | 模板 | `dist/build/mp-weixin/pages/index/index.wxml` | 1522 / d38b061ea20b | 1522 / 51f74d8d0e91 |

