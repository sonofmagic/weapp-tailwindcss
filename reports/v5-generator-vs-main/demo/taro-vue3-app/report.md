# demo/taro-vue3-app 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积增加 81.1 KiB，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 21 | 21 | 0 |
| 原始总体积 | 469.2 KiB | 388.0 KiB | +81.2 KiB |
| CSS 文件 | 2 | 2 | 0 |
| CSS 原始体积 | 192.4 KiB | 111.3 KiB | +81.1 KiB |
| JS 文件 | 8 | 8 | 0 |
| 规范化聚合 Hash | c1b365e69b99 | 254e8e4c362e | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 309，选择器 322，!important 11，@media 6，@supports 0，@layer 0，CSS 变量 115 | 规则 310，选择器 324，!important 18，@media 6，@supports 0，@layer 0，CSS 变量 217 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 6 | 6 | 0 | 0 |
| 其他 | 2 | 2 | 0 | 0 |
| 样式 | 2 | 2 | 0 | 0 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 脚本 | `dist/app.js` | 7701 / 90d6c74c6ffc | 7702 / 7ceacc18ee11 |
| 变更 | 其他 | `dist/app.js.LICENSE.txt` | 106 / 829518c6cdc1 | 106 / 3cb6678ce2bb |
| 变更 | 样式 | `dist/app.wxss` | 7619 / 4c2fad97908a | 9937 / ba029da7e8c1 |
| 变更 | 脚本 | `dist/comp.js` | 170 / 70ffa9408db8 | 171 / f41c1b48461d |
| 变更 | 脚本 | `dist/pages/index/index.js` | 7027 / 791055ee0ffd | 7029 / afe33264f5b8 |
| 变更 | 样式 | `dist/pages/index/index.wxss` | 189429 / c1c2a7511f47 | 104019 / fceef000403a |
| 变更 | 脚本 | `dist/pages/index/test.js` | 624 / b83978850515 | 627 / 1e9ed3e576d7 |
| 变更 | 脚本 | `dist/taro.js` | 124963 / 1ba9e13fc047 | 124966 / 536f13df5ec1 |
| 变更 | 脚本 | `dist/vendors.js` | 71059 / dd373e62cca8 | 70977 / 6f00983431aa |
| 变更 | 其他 | `dist/vendors.js.LICENSE.txt` | 207 / 926d1e38aea9 | 207 / 24f1b75a9a3d |

