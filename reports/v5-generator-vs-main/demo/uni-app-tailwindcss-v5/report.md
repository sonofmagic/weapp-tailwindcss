# demo/uni-app-tailwindcss-v5 核心产物对比报告

## 结论

- 产物状态：当前新增。
- 兼容性判断：新增项目：main 无对应项目，不能作为 v4 兼容性等价判断，只能作为 v5 质量样本。
- 样式质量判断：v5 CSS 原始体积增加 54.2 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。规则数量增加，建议重点抽查 reset/preflight、组件库选择器和分包样式。`!important` 数量增加，需确认是否符合期望的优先级策略。CSS 变量输出增加，通常有利于主题能力，但也要确认小程序端兼容。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 22 | 0 | 22 |
| 原始总体积 | 166.1 KiB | 0 B | +166.1 KiB |
| CSS 文件 | 3 | 0 | 3 |
| CSS 原始体积 | 54.2 KiB | 0 B | +54.2 KiB |
| JS 文件 | 8 | 0 | 8 |
| 规范化聚合 Hash | 988dc192fb78 | - | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 389，选择器 440，!important 1，@media 20，@supports 0，@layer 0，CSS 变量 212 | 规则 0，选择器 0，!important 0，@media 0，@supports 0，@layer 0，CSS 变量 0 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 8 | 0 | 8 | 0 |
| 配置/描述 | 6 | 0 | 6 | 0 |
| 模板 | 4 | 0 | 4 | 0 |
| 样式 | 3 | 0 | 3 | 0 |
| 资源 | 1 | 0 | 1 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 新增 | 脚本 | `dist/build/mp-weixin/app.js` | 393 / 21a7f98db037 | - |
| 新增 | 配置/描述 | `dist/build/mp-weixin/app.json` | 391 / c6cb558917d2 | - |
| 新增 | 样式 | `dist/build/mp-weixin/app.wxss` | 54489 / 6257ec1a5210 | - |
| 新增 | 脚本 | `dist/build/mp-weixin/common/assets.js` | 52 / 606e640e769b | - |
| 新增 | 脚本 | `dist/build/mp-weixin/common/vendor.js` | 102541 / f6d16d199a82 | - |
| 新增 | 脚本 | `dist/build/mp-weixin/components/HelloWorld.js` | 296 / d90645791fb6 | - |
| 新增 | 配置/描述 | `dist/build/mp-weixin/components/HelloWorld.json` | 48 / 035503c1a56d | - |
| 新增 | 模板 | `dist/build/mp-weixin/components/HelloWorld.wxml` | 73 / 1827addc5156 | - |
| 新增 | 脚本 | `dist/build/mp-weixin/index.js` | 14 / 77f5eec38c5e | - |
| 新增 | 脚本 | `dist/build/mp-weixin/pages-order/pages/home/home.js` | 260 / 4b97ad487276 | - |
| 新增 | 配置/描述 | `dist/build/mp-weixin/pages-order/pages/home/home.json` | 71 / 609d8d11274b | - |
| 新增 | 模板 | `dist/build/mp-weixin/pages-order/pages/home/home.wxml` | 568 / 2015c8a3d54a | - |
| 新增 | 样式 | `dist/build/mp-weixin/pages-order/pages/home/home.wxss` | 499 / 8c347d88b5b1 | - |
| 新增 | 脚本 | `dist/build/mp-weixin/pages-order/pages/user/user.js` | 226 / f7605e9eb315 | - |
| 新增 | 配置/描述 | `dist/build/mp-weixin/pages-order/pages/user/user.json` | 71 / 8e9be2a31851 | - |
| 新增 | 模板 | `dist/build/mp-weixin/pages-order/pages/user/user.wxml` | 951 / e1b10eb4f808 | - |
| 新增 | 样式 | `dist/build/mp-weixin/pages-order/pages/user/user.wxss` | 499 / 8c347d88b5b1 | - |
| 新增 | 脚本 | `dist/build/mp-weixin/pages/index/index.js` | 870 / 36a9bcf3c245 | - |
| 新增 | 配置/描述 | `dist/build/mp-weixin/pages/index/index.json` | 118 / 0a0c76c5fdd0 | - |
| 新增 | 模板 | `dist/build/mp-weixin/pages/index/index.wxml` | 1591 / ea3e5cda57cd | - |
| 新增 | 配置/描述 | `dist/build/mp-weixin/project.config.json` | 2012 / 76de01746c6a | - |
| 新增 | 资源 | `dist/build/mp-weixin/static/logo.png` | 4023 / 46719607502e | - |

