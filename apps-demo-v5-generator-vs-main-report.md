# apps/demo v5 生成模式与 main(v4) 核心产物对比报告

## 结论摘要

- 两边均先清理 `apps/*`、`demo/*` 下旧的 `dist/`、`build/`、`unpackage/` 和 `result.css`，再重新构建，避免历史产物混入。
- 当前分支 v5 生成模式构建成功，main(v4) worktree 构建成功。
- 本报告只比较核心构建产物，不比较项目源代码和配置文件。
- 本报告使用“文本产物先格式化/规范化，再比较内容”的口径，减少压缩格式导致的 diff 噪音；大型文本产物只在逐项目 diff 中记录摘要。
- 当前分支共有 28 个 apps/demo 项目，main 共有 25 个；公共项目 25 个，当前分支新增 3 个，main 独有 0 个。
- 公共项目中：2 个规范化后核心产物完全一致，19 个存在内容差异，4 个两边均无构建产物。
- 公共项目规范化后逐文件比较结果：变更 105 个文件，当前新增 62 个文件，相对 main 删除 61 个文件。
- 当前分支新增项目为 demo/mpx-tailwindcss-v5、demo/taro-vite-tailwindcss-v5、demo/uni-app-tailwindcss-v5，main 无对应项目，因此只记录 v5 生成模式产物指标。

## 构建信息

| 项 | 当前分支 v5 | main(v4) baseline |
| --- | --- | --- |
| 仓库路径 | `/Users/icebreaker/Projects/github/weapp-tailwindcss` | `/private/tmp/weapp-tailwindcss-main-baseline` |
| 分支 | `next` | `main` |
| Commit | `c18a8b677337136ca4c505239989893dae2a16fc` | `bf8a7d0468b077294a07e191b1ebb22f3666f830` |
| 构建结果 | 成功 | 成功 |

## 比较口径

- 比较范围：每个 `apps/*`、`demo/*` 项目下的 `dist`、`result.css`、`unpackage`、`build`。本次实际命中的产物类型为 `dist`、`result.css`。
- 不比较项目源代码和配置文件。
- 文本产物先格式化/规范化再比较，包括 CSS/WXSS、WXML/HTML、JSON/SourceMap、JS/WXS；二进制仍按原始 SHA-256 比较。
- 原始字节数仍保留，用来观察体积变化；状态和文件差异数量按规范化后的内容计算。
- `.DS_Store` 被忽略。

## 公共项目汇总

| 项目 | 状态 | v5 生成模式产物 | main(v4) 产物 | 变更 | 新增 | 删除 |
| --- | --- | --- | --- | ---: | ---: | ---: |
| `apps/react-app` | 差异 | 4 文件 / 280.1 KiB / CSS 1 个 33.4 KiB / JS 1 个 / 02a19b80e694 | 4 文件 / 280.1 KiB / CSS 1 个 33.4 KiB / JS 1 个 / bda8adff8ddd | 1 | 1 | 1 |
| `apps/tailwindcss-weapp` | 差异 | 129 文件 / 2.47 MiB / CSS 23 个 1.12 MiB / JS 37 个 / 243aba7f4d28 | 129 文件 / 1.71 MiB / CSS 23 个 367.3 KiB / JS 37 个 / 39814a2ed971 | 14 | 0 | 0 |
| `apps/taro-webpack-tailwindcss-v4` | 差异 | 20 文件 / 307.6 KiB / CSS 2 个 3.5 KiB / JS 7 个 / b23d2038d02a | 20 文件 / 311.1 KiB / CSS 2 个 7.1 KiB / JS 7 个 / 56750eb2b460 | 5 | 0 | 0 |
| `apps/vite-native` | 差异 | 21 文件 / 492.3 KiB / CSS 3 个 7.8 KiB / JS 10 个 / da15a01f2455 | 21 文件 / 491.1 KiB / CSS 3 个 6.6 KiB / JS 10 个 / d1088358e1af | 1 | 0 | 0 |
| `apps/vite-native-skyline` | 差异 | 12 文件 / 14.1 KiB / CSS 3 个 6.7 KiB / JS 3 个 / cccaf59d38ce | 12 文件 / 14.1 KiB / CSS 3 个 6.8 KiB / JS 3 个 / b4b069154a08 | 1 | 0 | 0 |
| `apps/vite-native-ts` | 差异 | 16 文件 / 152.8 KiB / CSS 4 个 24.4 KiB / JS 5 个 / b1286e91b694 | 16 文件 / 141.1 KiB / CSS 4 个 12.6 KiB / JS 5 个 / 9f4cbbbe75e0 | 1 | 0 | 0 |
| `apps/vite-native-ts-skyline` | 差异 | 16 文件 / 226.4 KiB / CSS 3 个 24.1 KiB / JS 6 个 / b6ecb0189f2d | 16 文件 / 227.0 KiB / CSS 3 个 24.1 KiB / JS 6 个 / fbfb43cdb63c | 5 | 2 | 2 |
| `apps/vue-app` | 差异 | 4 文件 / 176.4 KiB / CSS 1 个 45.8 KiB / JS 1 个 / 6fe467b1dd96 | 4 文件 / 176.3 KiB / CSS 1 个 45.8 KiB / JS 1 个 / 3e975b7254c5 | 1 | 1 | 1 |
| `apps/weapp-wechat-zhihu` | 一致 | 69 文件 / 1.10 MiB / CSS 8 个 13.0 KiB / JS 10 个 / 7b6608fb00cb | 69 文件 / 1.10 MiB / CSS 8 个 13.0 KiB / JS 10 个 / 7b6608fb00cb | 0 | 0 | 0 |
| `apps/web-postcss7-compat` | 一致 | 1 文件 / 2.9 KiB / CSS 1 个 2.9 KiB / JS 0 个 / 71ead820f977 | 1 文件 / 2.9 KiB / CSS 1 个 2.9 KiB / JS 0 个 / 71ead820f977 | 0 | 0 | 0 |
| `demo/gulp-app` | 差异 | 16 文件 / 41.0 KiB / CSS 3 个 6.5 KiB / JS 4 个 / f38697321a3d | 16 文件 / 41.1 KiB / CSS 3 个 6.6 KiB / JS 4 个 / 2fe0d34158c6 | 1 | 0 | 0 |
| `demo/mpx-app` | 差异 | 64 文件 / 1.32 MiB / CSS 14 个 152.6 KiB / JS 17 个 / 79a853c6a411 | 64 文件 / 1.32 MiB / CSS 14 个 152.2 KiB / JS 17 个 / 5661cd07def1 | 10 | 52 | 52 |
| `demo/mpx-tailwindcss-v4` | 差异 | 26 文件 / 1.05 MiB / CSS 4 个 13.7 KiB / JS 6 个 / 5ec821a35850 | 25 文件 / 1.04 MiB / CSS 3 个 8.8 KiB / JS 6 个 / 40f6f70d2848 | 12 | 6 | 5 |
| `demo/native` | 无产物 | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 | 0 | 0 |
| `demo/native-ts` | 差异 | 12 文件 / 1.04 MiB / CSS 3 个 1.03 MiB / JS 3 个 / f9f031419ad4 | 12 文件 / 1.04 MiB / CSS 3 个 1.04 MiB / JS 3 个 / ac9abc92bcd6 | 1 | 0 | 0 |
| `demo/taro-app` | 差异 | 66 文件 / 925.3 KiB / CSS 6 个 45.2 KiB / JS 24 个 / 12e79e21b315 | 66 文件 / 921.3 KiB / CSS 6 个 41.2 KiB / JS 24 个 / f02806a5260c | 16 | 0 | 0 |
| `demo/taro-app-vite` | 差异 | 19 文件 / 270.5 KiB / CSS 3 个 4.5 KiB / JS 7 个 / f88e69754094 | 19 文件 / 269.8 KiB / CSS 3 个 3.9 KiB / JS 7 个 / f1b2ad64129f | 1 | 0 | 0 |
| `demo/taro-vite-tailwindcss-v4` | 差异 | 16 文件 / 291.0 KiB / CSS 3 个 6.7 KiB / JS 6 个 / 206503c5aeae | 16 文件 / 287.3 KiB / CSS 3 个 3.0 KiB / JS 6 个 / dac9d5de0f77 | 1 | 0 | 0 |
| `demo/taro-vue3-app` | 差异 | 21 文件 / 469.2 KiB / CSS 2 个 192.4 KiB / JS 8 个 / c1b365e69b99 | 21 文件 / 388.0 KiB / CSS 2 个 111.3 KiB / JS 8 个 / 254e8e4c362e | 10 | 0 | 0 |
| `demo/taro-webpack-tailwindcss-v4` | 差异 | 19 文件 / 640.5 KiB / CSS 2 个 325.4 KiB / JS 7 个 / 59b9532325f8 | 19 文件 / 642.0 KiB / CSS 2 个 326.8 KiB / JS 7 个 / 345fedc1804f | 5 | 0 | 0 |
| `demo/uni-app-tailwindcss-v4` | 差异 | 22 文件 / 165.8 KiB / CSS 3 个 54.2 KiB / JS 8 个 / df73b7c6fa60 | 22 文件 / 143.8 KiB / CSS 3 个 32.1 KiB / JS 8 个 / 0bfc7bfd8696 | 5 | 0 | 0 |
| `demo/uni-app-vue3-vite` | 差异 | 94 文件 / 1.00 MiB / CSS 11 个 478.6 KiB / JS 32 个 / 588ab01071f7 | 94 文件 / 936.1 KiB / CSS 11 个 389.8 KiB / JS 32 个 / 2ee5bba4d8fb | 14 | 0 | 0 |
| `demo/uni-app-x-hbuilderx-tailwindcss3` | 无产物 | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 | 0 | 0 |
| `demo/uni-app-x-hbuilderx-tailwindcss4` | 无产物 | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 | 0 | 0 |
| `demo/web` | 无产物 | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 文件 / 0 B / CSS 0 个 0 B / JS 0 个 / - | 0 | 0 | 0 |

## 当前分支新增项目

| 项目 | v5 生成模式产物 |
| --- | --- |
| `demo/mpx-tailwindcss-v5` | 26 文件 / 1.25 MiB / CSS 4 个 15.1 KiB / JS 6 个 / d4c2f6105af1 |
| `demo/taro-vite-tailwindcss-v5` | 17 文件 / 345.8 KiB / CSS 3 个 26.3 KiB / JS 7 个 / c42a1438cd85 |
| `demo/uni-app-tailwindcss-v5` | 22 文件 / 166.1 KiB / CSS 3 个 54.2 KiB / JS 8 个 / 988dc192fb78 |

## main 独有项目

无。

## 无产物项目

- `demo/native`
- `demo/uni-app-x-hbuilderx-tailwindcss3`
- `demo/uni-app-x-hbuilderx-tailwindcss4`
- `demo/web`

## 差异项目明细

### apps/react-app

- 汇总：变更 1，新增 1，删除 1。
- v5：4 文件 / 280.1 KiB / CSS 1 个 33.4 KiB / JS 1 个 / 02a19b80e694。
- main(v4)：4 文件 / 280.1 KiB / CSS 1 个 33.4 KiB / JS 1 个 / bda8adff8ddd。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 新增 | `dist/assets/index-B-aRXF0u.js` | 250639 / d934a4ecdc6c | - |
| 删除 | `dist/assets/index-uM4J0RC_.js` | - | 250639 / c114ccc0d5fb |
| 变更 | `dist/index.html` | 456 / d31461dcc2b7 | 456 / c77dd15468b0 |

### apps/tailwindcss-weapp

- 汇总：变更 14，新增 0，删除 0。
- v5：129 文件 / 2.47 MiB / CSS 23 个 1.12 MiB / JS 37 个 / 243aba7f4d28。
- main(v4)：129 文件 / 1.71 MiB / CSS 23 个 367.3 KiB / JS 37 个 / 39814a2ed971。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/build/mp-weixin/app.wxss` | 911560 / d3dc7ffbe615 | 113236 / 82c27bda256d |
| 变更 | `dist/build/mp-weixin/components/BaseLayout.wxml` | 129 / eecb0be36642 | 129 / 8c0425f5bac4 |
| 变更 | `dist/build/mp-weixin/components/Navbar.wxml` | 297 / 143a5492d7a8 | 297 / 2c5f81d048a8 |
| 变更 | `dist/build/mp-weixin/node-modules/uni-app-mp-html/components/mp-html/mp-html.wxml` | 867 / 34df8cc8d019 | 867 / 033ec0f34221 |
| 变更 | `dist/build/mp-weixin/node-modules/uni-app-mp-html/components/mp-html/node/node.js` | 16485 / 3c62215ab9c2 | 16485 / c30bc122abb6 |
| 变更 | `dist/build/mp-weixin/node-modules/uni-app-mp-html/components/mp-html/node/node.wxss` | 6298 / b076ff3ede75 | 6290 / 14bc034cb9af |
| 变更 | `dist/build/mp-weixin/node-modules/uview-plus/components/u-collapse/u-collapse.wxml` | 102 / 7faf9c267cac | 102 / 26f2c1d6bef7 |
| 变更 | `dist/build/mp-weixin/pages/index/detail.wxml` | 1772 / c4fa4a0bd62e | 1772 / 2e125091980c |
| 变更 | `dist/build/mp-weixin/pages/index/detail.wxss` | 9164 / 4b7eab8b7d84 | 12890 / 405e680fd1c9 |
| 变更 | `dist/build/mp-weixin/pages/index/index.js` | 3156 / 40e3a4dfb759 | 3156 / 270383112d0b |
| 变更 | `dist/build/mp-weixin/pages/index/index.wxml` | 2937 / 77c13969bd50 | 2937 / de57e067d48e |
| 变更 | `dist/build/mp-weixin/pages/theme/code.wxml` | 81 / b79a8b6893fc | 81 / aaefa0faa643 |
| 变更 | `dist/build/mp-weixin/pages/theme/index.js` | 1950 / 6f1879618f58 | 1950 / 364f8b22e17e |
| 变更 | `dist/build/mp-weixin/pages/theme/index.wxml` | 1986 / a4886b7d4d9c | 1986 / 280927532e24 |

### apps/taro-webpack-tailwindcss-v4

- 汇总：变更 5，新增 0，删除 0。
- v5：20 文件 / 307.6 KiB / CSS 2 个 3.5 KiB / JS 7 个 / b23d2038d02a。
- main(v4)：20 文件 / 311.1 KiB / CSS 2 个 7.1 KiB / JS 7 个 / 56750eb2b460。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.js` | 96226 / ba730611a783 | 96225 / 283df2d0c992 |
| 变更 | `dist/app.wxss` | 3584 / 3cc32a223b4c | 7224 / 17fcb02a15be |
| 变更 | `dist/comp.js` | 171 / e2c14a566ef5 | 171 / 5aa70324cd64 |
| 变更 | `dist/pages/index/index.js` | 2590 / 9fb1982284e2 | 2590 / b4aa5178cdf0 |
| 变更 | `dist/taro.js` | 132899 / 7748ce5e82e3 | 132899 / 39b1ac3c99bc |

### apps/vite-native

- 汇总：变更 1，新增 0，删除 0。
- v5：21 文件 / 492.3 KiB / CSS 3 个 7.8 KiB / JS 10 个 / da15a01f2455。
- main(v4)：21 文件 / 491.1 KiB / CSS 3 个 6.6 KiB / JS 10 个 / d1088358e1af。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.wxss` | 7890 / 7667c37976b0 | 6612 / 663d89a65592 |

### apps/vite-native-skyline

- 汇总：变更 1，新增 0，删除 0。
- v5：12 文件 / 14.1 KiB / CSS 3 个 6.7 KiB / JS 3 个 / cccaf59d38ce。
- main(v4)：12 文件 / 14.1 KiB / CSS 3 个 6.8 KiB / JS 3 个 / b4b069154a08。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.wxss` | 2240 / a6a760903b60 | 2300 / fc7e15eaae1d |

### apps/vite-native-ts

- 汇总：变更 1，新增 0，删除 0。
- v5：16 文件 / 152.8 KiB / CSS 4 个 24.4 KiB / JS 5 个 / b1286e91b694。
- main(v4)：16 文件 / 141.1 KiB / CSS 4 个 12.6 KiB / JS 5 个 / 9f4cbbbe75e0。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.wxss` | 22740 / 541f0b498566 | 10708 / f3912d91ad44 |

### apps/vite-native-ts-skyline

- 汇总：变更 5，新增 2，删除 2。
- v5：16 文件 / 226.4 KiB / CSS 3 个 24.1 KiB / JS 6 个 / b6ecb0189f2d。
- main(v4)：16 文件 / 227.0 KiB / CSS 3 个 24.1 KiB / JS 6 个 / fbfb43cdb63c。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.js` | 392 / 49b8dc48a8bf | 405 / b0ac96eb2dcd |
| 变更 | `dist/app.wxss` | 24516 / 8e553cc8234c | 24535 / 841329eece1e |
| 变更 | `dist/components/skyline-navbar/index.js` | 2615 / 526a0e66487d | 2628 / 9aac0915fec1 |
| 变更 | `dist/pages/cart/index.js` | 14475 / b317d507bb5b | 14479 / f55854bd61c5 |
| 变更 | `dist/pages/index/index.js` | 3613 / cf276ab66e5f | 3626 / de161c05d6d1 |
| 新增 | `dist/src-BF-e4_0K.js` | 115565 / 6f5e4d8d1ba4 | - |
| 新增 | `dist/weapp-vendors/wevu-ref.js` | 53969 / 2b35ba0e746f | - |
| 删除 | `dist/weapp-vendors/wevu-router.js` | - | 52066 / 74d0e8cb65d8 |
| 删除 | `dist/weapp-vendors/wevu-src.js` | - | 117955 / 5957dab98675 |

### apps/vue-app

- 汇总：变更 1，新增 1，删除 1。
- v5：4 文件 / 176.4 KiB / CSS 1 个 45.8 KiB / JS 1 个 / 6fe467b1dd96。
- main(v4)：4 文件 / 176.3 KiB / CSS 1 个 45.8 KiB / JS 1 个 / 3e975b7254c5。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 新增 | `dist/assets/index-BcJjhnso.js` | 131796 / 805806cbd97b | - |
| 删除 | `dist/assets/index-C-alYD4W.js` | - | 131712 / b322c5804314 |
| 变更 | `dist/index.html` | 461 / 8d823fbf5fd1 | 461 / 02629ea35d33 |

### demo/gulp-app

- 汇总：变更 1，新增 0，删除 0。
- v5：16 文件 / 41.0 KiB / CSS 3 个 6.5 KiB / JS 4 个 / f38697321a3d。
- main(v4)：16 文件 / 41.1 KiB / CSS 3 个 6.6 KiB / JS 4 个 / 2fe0d34158c6。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.wxss` | 6480 / 8988e88c938c | 6570 / 16e06cb0d856 |

### demo/mpx-app

- 汇总：变更 10，新增 52，删除 52。
- v5：64 文件 / 1.32 MiB / CSS 14 个 152.6 KiB / JS 17 个 / 79a853c6a411。
- main(v4)：64 文件 / 1.32 MiB / CSS 14 个 152.2 KiB / JS 17 个 / 5661cd07def1。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/wx/app.js` | 14166 / c7020119ff95 | 14165 / 741f9dccb862 |
| 变更 | `dist/wx/app.js.map` | 49038 / fad0457ad119 | 49038 / f78352e3b6ca |
| 变更 | `dist/wx/app.wxss` | 125 / b4b198cd0bdd | 125 / c5e262eba3bc |
| 变更 | `dist/wx/bundle.js` | 181851 / 67b4ef240aff | 181826 / e1b2b4c7824b |
| 变更 | `dist/wx/bundle.js.map` | 877046 / 46822dc4995c | 877046 / a3625b84365c |
| 新增 | `dist/wx/components/list567f1c84/index.js` | 1020 / ef11fab21c14 | - |
| 新增 | `dist/wx/components/list567f1c84/index.js.map` | 3640 / 770c1ef65a1c | - |
| 新增 | `dist/wx/components/list567f1c84/index.json` | 18 / 3cac147888c7 | - |
| 新增 | `dist/wx/components/list567f1c84/index.wxml` | 229 / 811d8fee7dfc | - |
| 新增 | `dist/wx/components/list567f1c84/index.wxss` | 0 / 01ba4719c80b | - |
| 删除 | `dist/wx/components/list750254b0/index.js` | - | 1020 / 6438145983c8 |
| 删除 | `dist/wx/components/list750254b0/index.js.map` | - | 3640 / d027cf27e25d |
| 删除 | `dist/wx/components/list750254b0/index.json` | - | 18 / 3cac147888c7 |
| 删除 | `dist/wx/components/list750254b0/index.wxml` | - | 229 / 2837ed06b2d6 |
| 删除 | `dist/wx/components/list750254b0/index.wxss` | - | 0 / 01ba4719c80b |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.js` | 3418 / d323e7e28df1 | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.js.map` | 9292 / d2b3fa7531d9 | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.json` | 235 / 0c82b4ba98dc | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.wxml` | 2383 / 486102259d4e | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.wxss` | 23031 / da78f8ed08b6 | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.js` | 1637 / c791c48fa1d7 | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.js.map` | 5206 / f4d8837457e9 | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.json` | 71 / 1abd7a519afa | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.wxml` | 583 / 77a6d379e7e0 | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.wxss` | 107397 / 5c0c187b186a | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.js` | 1709 / 34c5aa41779b | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.js.map` | 5347 / 80751832edba | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.json` | 71 / 1abd7a519afa | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.wxml` | 1970 / 7fbe0b622ea3 | - |
| 新增 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.wxss` | 3552 / 6793e15e05ff | - |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.js` | - | 3415 / 80f5b1c8b976 |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.js.map` | - | 9248 / 95d502ad4098 |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.json` | - | 235 / 8430ca6f71f8 |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.wxml` | - | 2383 / 3d0ce36befae |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.wxss` | - | 23031 / d9cf13ab3946 |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.js` | - | 1637 / 797d1e45358a |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.js.map` | - | 5162 / 9b62f237c71d |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.json` | - | 71 / 1abd7a519afa |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.wxml` | - | 583 / 2632aa51ea53 |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.wxss` | - | 107397 / f5cbe826633c |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.js` | - | 1707 / 78d229109176 |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.js.map` | - | 5303 / 3efa4a672b7a |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.json` | - | 71 / 1abd7a519afa |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.wxml` | - | 1970 / deb49a8f1339 |
| 删除 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.wxss` | - | 3552 / c9e25b44ba48 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.js` | - | 3687 / 5b91aebb4ed4 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.js.map` | - | 12490 / 3d2ef4551aad |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.json` | - | 162 / 27baa94d2f5c |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.wxml` | - | 1889 / 3c995e13a89b |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.wxss` | - | 3538 / 4e0828f003b6 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.js` | - | 864 / a78baa63637d |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.js.map` | - | 3186 / c7573022ef55 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.json` | - | 97 / 9f7e4c71d7b5 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.wxml` | - | 446 / a3d19f5fe130 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.wxss` | - | 11599 / b12bf5bb8123 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.js` | - | 717 / 64a5494f9eda |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.js.map` | - | 2593 / f1ec5ddc62a5 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.json` | - | 18 / 3cac147888c7 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.wxml` | - | 242 / 0cec02c08c43 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.wxss` | - | 830 / cbd550375b04 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.js` | - | 808 / 53a53c23730c |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.js.map` | - | 2947 / b97e711986c7 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.json` | - | 18 / 3cac147888c7 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.wxml` | - | 540 / f993b1c4b7c2 |
| 删除 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.wxss` | - | 2136 / f118f650382f |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.js` | 3687 / e9e24895305a | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.js.map` | 12534 / 5954b63d2e5c | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.json` | 162 / c99bb9c1bff2 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.wxml` | 1889 / 6fe898cc7dc3 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.wxss` | 3538 / a4dec020052c | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.js` | 868 / 293e613bb382 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.js.map` | 3230 / e2209fdb7ccb | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.json` | 97 / ad6007081e85 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.wxml` | 446 / 3dfbb133f765 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.wxss` | 11599 / b1236cf37086 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.js` | 717 / 7d8f4021bdf7 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.js.map` | 2637 / b2610658f6b8 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.json` | 18 / 3cac147888c7 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.wxml` | 242 / a2c91e7b1893 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.wxss` | 830 / 798097e2b220 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.js` | 809 / d823ab6542bd | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.js.map` | 2991 / 5dac86b222e4 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.json` | 18 / 3cac147888c7 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.wxml` | 540 / 76fc644b7982 | - |
| 新增 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.wxss` | 2136 / 2386d1144ff2 | - |
| 变更 | `dist/wx/outputMap.json` | 3135 / 0ac1eccfd607 | 3002 / 196cef4f44de |
| 变更 | `dist/wx/pages/index.js` | 1573 / b0bf0d90ff1b | 1575 / a76e763edac4 |
| 变更 | `dist/wx/pages/index.js.map` | 4560 / f76081c3008d | 4560 / b6bb8ec50895 |
| 变更 | `dist/wx/pages/index.json` | 208 / 870122e84165 | 208 / 184095a9c5ce |
| 变更 | `dist/wx/pages/index.wxml` | 629 / 583875d7b157 | 629 / 557cfe1967b7 |
| 新增 | `dist/wx/styles/base487e0d61.wxss` | 1528 / 8b311aff13b4 | - |
| 删除 | `dist/wx/styles/base55ac6296.wxss` | - | 1272 / e83fdac40abf |
| 删除 | `dist/wx/styles/components4695ad8c.wxss` | - | 0 / 01ba4719c80b |
| 新增 | `dist/wx/styles/components63da9234.wxss` | 0 / 01ba4719c80b | - |
| 新增 | `dist/wx/styles/index0af78c53.wxss` | 163 / 6b42ce66d184 | - |
| 删除 | `dist/wx/styles/index97c4e6b2.wxss` | - | 163 / 6b42ce66d184 |
| 新增 | `dist/wx/styles/index9a27da9c.wxss` | 1180 / 970995a6f7d4 | - |
| 删除 | `dist/wx/styles/indexb6747a44.wxss` | - | 1180 / 970995a6f7d4 |
| 新增 | `dist/wx/styles/utilities3d066604.wxss` | 1225 / 464c4b153a2b | - |
| 删除 | `dist/wx/styles/utilities6c3b4da0.wxss` | - | 1062 / 448b0229eb5e |
| 删除 | `dist/wx/template/icon70cef32c.wxml` | - | 314 / 245fb4522376 |
| 新增 | `dist/wx/template/icon7927b7d8.wxml` | 314 / 245fb4522376 | - |
| 删除 | `dist/wx/wxs/index0c69d688.wxs` | - | 3760 / 3508b2ab4f05 |
| 新增 | `dist/wx/wxs/index4793fe18.wxs` | 3690 / 1b444631691c | - |
| 删除 | `dist/wx/wxs/index4af25bfa.wxs` | - | 4099 / 425e8ef73c48 |
| 删除 | `dist/wx/wxs/index63e09dc0.wxs` | - | 3690 / 1b444631691c |
| 新增 | `dist/wx/wxs/index7f1d0b30.wxs` | 3760 / 3508b2ab4f05 | - |
| 新增 | `dist/wx/wxs/index8eba9aa2.wxs` | 4099 / 425e8ef73c48 | - |
| 删除 | `dist/wx/wxs/stringify1330db56.wxs` | - | 7043 / 4003a104a147 |
| 新增 | `dist/wx/wxs/stringify6c96c029.wxs` | 7043 / 4003a104a147 | - |
| 删除 | `dist/wx/wxs/utils00fd38f5.wxs` | - | 4480 / 9cacaf46aff2 |
| 新增 | `dist/wx/wxs/utils3b6c8d5d.wxs` | 4690 / d7e8bdfbb184 | - |
| 删除 | `dist/wx/wxs/utils64998389.wxs` | - | 4690 / d7e8bdfbb184 |
| 新增 | `dist/wx/wxs/utilsc666da6e.wxs` | 4480 / 9cacaf46aff2 | - |

### demo/mpx-tailwindcss-v4

- 汇总：变更 12，新增 6，删除 5。
- v5：26 文件 / 1.05 MiB / CSS 4 个 13.7 KiB / JS 6 个 / 5ec821a35850。
- main(v4)：25 文件 / 1.04 MiB / CSS 3 个 8.8 KiB / JS 6 个 / 40f6f70d2848。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/wx/app.js` | 14199 / c034ecdd4a80 | 14198 / 1c2ffd8ad149 |
| 变更 | `dist/wx/app.js.map` | 49648 / 14e9674f8152 | 49637 / 77fa46ba9615 |
| 变更 | `dist/wx/app.wxss` | 37 / 3d14b44a93db | 37 / 9c0008398ff5 |
| 变更 | `dist/wx/bundle.js` | 172969 / dc1dc2ff082b | 172943 / 9b5c7b7e819d |
| 变更 | `dist/wx/bundle.js.map` | 829964 / c6c00563ef11 | 829964 / 35eb45200f08 |
| 删除 | `dist/wx/components/list17ff5079/index.js` | - | 870 / 49f677dbaca8 |
| 删除 | `dist/wx/components/list17ff5079/index.js.map` | - | 2356 / 5554c6e70126 |
| 删除 | `dist/wx/components/list17ff5079/index.json` | - | 18 / 3cac147888c7 |
| 删除 | `dist/wx/components/list17ff5079/index.wxml` | - | 119 / 3c6e11f7f64b |
| 新增 | `dist/wx/components/list27ad1c25/index.js` | 871 / e9b3487267c3 | - |
| 新增 | `dist/wx/components/list27ad1c25/index.js.map` | 2356 / 874aee726eaf | - |
| 新增 | `dist/wx/components/list27ad1c25/index.json` | 18 / 3cac147888c7 | - |
| 新增 | `dist/wx/components/list27ad1c25/index.wxml` | 119 / 3c6e11f7f64b | - |
| 变更 | `dist/wx/custom-tab-bar/index.js` | 773 / 586ec0e11434 | 772 / 0cc815bc0522 |
| 变更 | `dist/wx/custom-tab-bar/index.js.map` | 2052 / 6b1c5d9b102f | 2052 / a5d5c270cf9e |
| 变更 | `dist/wx/pages/component/index.js` | 636 / e123c8e90b32 | 636 / 03b68fade015 |
| 变更 | `dist/wx/pages/component/index.js.map` | 1671 / d22e28a8e013 | 1671 / 25d5a2414071 |
| 变更 | `dist/wx/pages/index.js` | 788 / 7e45674c005f | 788 / 9875014bf26f |
| 变更 | `dist/wx/pages/index.js.map` | 2589 / 5e6c9d4bac5b | 2589 / 7365e2734492 |
| 变更 | `dist/wx/pages/index.json` | 61 / c226ba97111f | 61 / 9a1d230c155d |
| 新增 | `dist/wx/styles/app3b4a1ac6.wxss` | 8473 / cfac9facdfe6 | - |
| 删除 | `dist/wx/styles/app6fba04f1.wxss` | - | 9020 / 09fcb5922a49 |
| 新增 | `dist/wx/styles/index6ff7f9ca.wxss` | 5470 / 2aefb69dc0d1 | - |

### demo/native-ts

- 汇总：变更 1，新增 0，删除 0。
- v5：12 文件 / 1.04 MiB / CSS 3 个 1.03 MiB / JS 3 个 / f9f031419ad4。
- main(v4)：12 文件 / 1.04 MiB / CSS 3 个 1.04 MiB / JS 3 个 / ac9abc92bcd6。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.wxss` | 1078470 / c112e09a2d9e | 1082699 / ac15c7e71b87 |

### demo/taro-app

- 汇总：变更 16，新增 0，删除 0。
- v5：66 文件 / 925.3 KiB / CSS 6 个 45.2 KiB / JS 24 个 / 12e79e21b315。
- main(v4)：66 文件 / 921.3 KiB / CSS 6 个 41.2 KiB / JS 24 个 / f02806a5260c。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.js` | 99443 / d277f07a5a10 | 99443 / 225e2cbf2572 |
| 变更 | `dist/app.wxss` | 11247 / 17aa45e12a8e | 13877 / 7ffcd76dcbaa |
| 变更 | `dist/comp.js` | 171 / c52588bd89e4 | 171 / 3ef0f19633a0 |
| 变更 | `dist/moduleB/comp.js` | 278 / ea40d1c62263 | 278 / c039c6ac567a |
| 变更 | `dist/moduleB/custom-wrapper.js` | 222 / 82a5e37c72f5 | 222 / 86476c52f7c6 |
| 变更 | `dist/moduleB/pages/index.js` | 1380 / d05e4bb6bc81 | 1380 / be9f5aaf6ad8 |
| 变更 | `dist/moduleB/pages/index.wxss` | 12436 / df0a13aa03fd | 13762 / 58b699a9d4ba |
| 变更 | `dist/moduleB/vendors.js` | 229821 / 589c23461b23 | 229821 / 42ae931a7778 |
| 变更 | `dist/moduleC/comp.js` | 278 / 33c1d2fdaf57 | 278 / bdc1faf49373 |
| 变更 | `dist/moduleC/custom-wrapper.js` | 221 / 8694bf7203e1 | 221 / 80da7c63de91 |
| 变更 | `dist/moduleC/pages/index.js` | 1378 / 7eef509dc579 | 1378 / f09beb432879 |
| 变更 | `dist/moduleC/pages/index.wxss` | 12436 / df0a13aa03fd | 13762 / 58b699a9d4ba |
| 变更 | `dist/moduleC/vendors.js` | 229820 / 8f5add7d4610 | 229820 / fda7ddf02ed7 |
| 变更 | `dist/pages/debug/index.wxss` | 9702 / c094860cf049 | 111 / d296e94efa04 |
| 变更 | `dist/pages/index/index.wxss` | 446 / ef7115496ffd | 666 / f11f255cbc3c |
| 变更 | `dist/taro.js` | 132848 / 0185e278d7c4 | 132847 / f7e44cc7cb68 |

### demo/taro-app-vite

- 汇总：变更 1，新增 0，删除 0。
- v5：19 文件 / 270.5 KiB / CSS 3 个 4.5 KiB / JS 7 个 / f88e69754094。
- main(v4)：19 文件 / 269.8 KiB / CSS 3 个 3.9 KiB / JS 7 个 / f1b2ad64129f。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app-origin.wxss` | 4577 / 352ca6f80e9b | 3889 / b6b31bed2613 |

### demo/taro-vite-tailwindcss-v4

- 汇总：变更 1，新增 0，删除 0。
- v5：16 文件 / 291.0 KiB / CSS 3 个 6.7 KiB / JS 6 个 / 206503c5aeae。
- main(v4)：16 文件 / 287.3 KiB / CSS 3 个 3.0 KiB / JS 6 个 / dac9d5de0f77。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app-origin.wxss` | 6787 / 28cdb15341ae | 3026 / c63d583d9e1e |

### demo/taro-vue3-app

- 汇总：变更 10，新增 0，删除 0。
- v5：21 文件 / 469.2 KiB / CSS 2 个 192.4 KiB / JS 8 个 / c1b365e69b99。
- main(v4)：21 文件 / 388.0 KiB / CSS 2 个 111.3 KiB / JS 8 个 / 254e8e4c362e。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.js` | 7701 / 90d6c74c6ffc | 7702 / 7ceacc18ee11 |
| 变更 | `dist/app.js.LICENSE.txt` | 106 / 829518c6cdc1 | 106 / 3cb6678ce2bb |
| 变更 | `dist/app.wxss` | 7619 / 4c2fad97908a | 9937 / ba029da7e8c1 |
| 变更 | `dist/comp.js` | 170 / 70ffa9408db8 | 171 / f41c1b48461d |
| 变更 | `dist/pages/index/index.js` | 7027 / 791055ee0ffd | 7029 / afe33264f5b8 |
| 变更 | `dist/pages/index/index.wxss` | 189429 / c1c2a7511f47 | 104019 / fceef000403a |
| 变更 | `dist/pages/index/test.js` | 624 / b83978850515 | 627 / 1e9ed3e576d7 |
| 变更 | `dist/taro.js` | 124963 / 1ba9e13fc047 | 124966 / 536f13df5ec1 |
| 变更 | `dist/vendors.js` | 71059 / dd373e62cca8 | 70977 / 6f00983431aa |
| 变更 | `dist/vendors.js.LICENSE.txt` | 207 / 926d1e38aea9 | 207 / 24f1b75a9a3d |

### demo/taro-webpack-tailwindcss-v4

- 汇总：变更 5，新增 0，删除 0。
- v5：19 文件 / 640.5 KiB / CSS 2 个 325.4 KiB / JS 7 个 / 59b9532325f8。
- main(v4)：19 文件 / 642.0 KiB / CSS 2 个 326.8 KiB / JS 7 个 / 345fedc1804f。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/app.js` | 96359 / 0e79d246e6af | 96357 / 2962b2469774 |
| 变更 | `dist/app.wxss` | 324468 / 0df3b2116174 | 325956 / 3dfcf6d22051 |
| 变更 | `dist/comp.js` | 171 / a5e4b47b3c25 | 171 / f7b4c05e80c8 |
| 变更 | `dist/pages/index/index.js` | 16388 / 5255e12d1207 | 16388 / a741d5eeb3ca |
| 变更 | `dist/taro.js` | 133043 / 6744ea11445b | 133043 / 549a56bf2947 |

### demo/uni-app-tailwindcss-v4

- 汇总：变更 5，新增 0，删除 0。
- v5：22 文件 / 165.8 KiB / CSS 3 个 54.2 KiB / JS 8 个 / df73b7c6fa60。
- main(v4)：22 文件 / 143.8 KiB / CSS 3 个 32.1 KiB / JS 8 个 / 0bfc7bfd8696。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/build/mp-weixin/app.wxss` | 54461 / 349112554854 | 7465 / 3306db728102 |
| 变更 | `dist/build/mp-weixin/common/vendor.js` | 102541 / f6d16d199a82 | 102539 / 21147d1bb416 |
| 变更 | `dist/build/mp-weixin/pages-order/pages/home/home.wxss` | 499 / 8c347d88b5b1 | 12724 / 5657a478b4b5 |
| 变更 | `dist/build/mp-weixin/pages-order/pages/user/user.wxss` | 499 / 8c347d88b5b1 | 12724 / 5657a478b4b5 |
| 变更 | `dist/build/mp-weixin/pages/index/index.wxml` | 1522 / d38b061ea20b | 1522 / 51f74d8d0e91 |

### demo/uni-app-vue3-vite

- 汇总：变更 14，新增 0，删除 0。
- v5：94 文件 / 1.00 MiB / CSS 11 个 478.6 KiB / JS 32 个 / 588ab01071f7。
- main(v4)：94 文件 / 936.1 KiB / CSS 11 个 389.8 KiB / JS 32 个 / 2ee5bba4d8fb。

| 类型 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- |
| 变更 | `dist/build/mp-weixin/app.wxss` | 138176 / f846c7f0877c | 124717 / 288f519d4a68 |
| 变更 | `dist/build/mp-weixin/moduleA/pages/a.wxml` | 446 / fd582684f3ef | 446 / 25d3407381de |
| 变更 | `dist/build/mp-weixin/moduleA/pages/a.wxss` | 51537 / 3513aca7352a | 41720 / 2b52d00f4738 |
| 变更 | `dist/build/mp-weixin/moduleA/pages/b.wxml` | 446 / fd582684f3ef | 446 / 25d3407381de |
| 变更 | `dist/build/mp-weixin/moduleA/pages/b.wxss` | 51537 / 3513aca7352a | 41720 / 2b52d00f4738 |
| 变更 | `dist/build/mp-weixin/moduleA/pages/index.wxss` | 51537 / 3513aca7352a | 41720 / 2b52d00f4738 |
| 变更 | `dist/build/mp-weixin/node-modules/uview-plus/components/u-button/u-button.wxss` | 21102 / 95b41445d4df | 21079 / 3fd5df2bbce8 |
| 变更 | `dist/build/mp-weixin/pages/index/index.js` | 4453 / c92ffa65f874 | 4453 / 48ffb8e25072 |
| 变更 | `dist/build/mp-weixin/pages/index/index.wxml` | 5793 / 3ce38e9edd84 | 5634 / 67a70d701a2a |
| 变更 | `dist/build/mp-weixin/pages/index/index.wxss` | 23324 / 552945b4f13e | 35406 / fed189cf9d75 |
| 变更 | `dist/build/mp-weixin/pages/index/peer.wxss` | 52808 / 32e72aa4943a | 17492 / 79bae858c697 |
| 变更 | `dist/build/mp-weixin/pages/issue/case55.wxml` | 415 / d3c2d247cbef | 415 / 152a9c4f7251 |
| 变更 | `dist/build/mp-weixin/pages/issue/typography.wxss` | 61423 / f80e08ac44f4 | 36671 / cea98443da52 |
| 变更 | `dist/build/mp-weixin/subs/demo/pages/index.wxml` | 268 / 43b2b42162f2 | 268 / 87b6eb54f0dc |

## 说明

- `demo/native`、`demo/uni-app-x-hbuilderx-tailwindcss3`、`demo/uni-app-x-hbuilderx-tailwindcss4` 的 build 脚本为 echo 类命令，因此两边都没有命中上述产物目录。
- `demo/web` 的 build 脚本执行成功，但没有在上述比较范围内生成产物文件。
- 差异较多的 Taro/Vite/MPX/Uni 项目包含框架生成文件、压缩后 JS/WXML/WXSS、基础模板文件和 sourcemap；本报告只陈述格式化/规范化后的核心产物内容差异，不直接判定功能回归。
- 当前新增的 v5 demo 在 main 上不存在对应目录，无法做一一 diff；已单独记录其生成产物指标。
