# demo/taro-app 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积增加 4.0 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 66 | 66 | 0 |
| 原始总体积 | 925.3 KiB | 921.3 KiB | +4.0 KiB |
| CSS 文件 | 6 | 6 | 0 |
| CSS 原始体积 | 45.2 KiB | 41.2 KiB | +4.0 KiB |
| JS 文件 | 24 | 24 | 0 |
| 规范化聚合 Hash | 12e79e21b315 | f02806a5260c | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 481，选择器 552，!important 26，@media 0，@supports 0，@layer 0，CSS 变量 424 | 规则 370，选择器 426，!important 29，@media 0，@supports 0，@layer 0，CSS 变量 664 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 11 | 11 | 0 | 0 |
| 样式 | 5 | 5 | 0 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 脚本 | `dist/app.js` | 99443 / d277f07a5a10 | 99443 / 225e2cbf2572 |
| 变更 | 样式 | `dist/app.wxss` | 11247 / 17aa45e12a8e | 13877 / 7ffcd76dcbaa |
| 变更 | 脚本 | `dist/comp.js` | 171 / c52588bd89e4 | 171 / 3ef0f19633a0 |
| 变更 | 脚本 | `dist/moduleB/comp.js` | 278 / ea40d1c62263 | 278 / c039c6ac567a |
| 变更 | 脚本 | `dist/moduleB/custom-wrapper.js` | 222 / 82a5e37c72f5 | 222 / 86476c52f7c6 |
| 变更 | 脚本 | `dist/moduleB/pages/index.js` | 1380 / d05e4bb6bc81 | 1380 / be9f5aaf6ad8 |
| 变更 | 样式 | `dist/moduleB/pages/index.wxss` | 12436 / df0a13aa03fd | 13762 / 58b699a9d4ba |
| 变更 | 脚本 | `dist/moduleB/vendors.js` | 229821 / 589c23461b23 | 229821 / 42ae931a7778 |
| 变更 | 脚本 | `dist/moduleC/comp.js` | 278 / 33c1d2fdaf57 | 278 / bdc1faf49373 |
| 变更 | 脚本 | `dist/moduleC/custom-wrapper.js` | 221 / 8694bf7203e1 | 221 / 80da7c63de91 |
| 变更 | 脚本 | `dist/moduleC/pages/index.js` | 1378 / 7eef509dc579 | 1378 / f09beb432879 |
| 变更 | 样式 | `dist/moduleC/pages/index.wxss` | 12436 / df0a13aa03fd | 13762 / 58b699a9d4ba |
| 变更 | 脚本 | `dist/moduleC/vendors.js` | 229820 / 8f5add7d4610 | 229820 / fda7ddf02ed7 |
| 变更 | 样式 | `dist/pages/debug/index.wxss` | 9702 / c094860cf049 | 111 / d296e94efa04 |
| 变更 | 样式 | `dist/pages/index/index.wxss` | 446 / ef7115496ffd | 666 / f11f255cbc3c |
| 变更 | 脚本 | `dist/taro.js` | 132848 / 0185e278d7c4 | 132847 / f7e44cc7cb68 |

