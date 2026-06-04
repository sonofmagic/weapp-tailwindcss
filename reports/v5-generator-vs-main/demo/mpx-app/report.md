# demo/mpx-app 核心产物对比报告

## 结论

- 产物状态：差异。
- 兼容性判断：中高风险：模板或脚本内容也发生变化，需要确认 class 转换、运行时代码和框架生成代码是否仍与 v4 行为一致。
- 样式质量判断：v5 CSS 原始体积增加 419 B，可能代表生成覆盖更完整，但需要排查未使用规则或重复注入。
- 核心产物 diff：见 `artifact.diff`。文本产物已先格式化/规范化再比较，大型文件只记录内容 hash 和大小摘要。

## 产物指标

| 项 | v5 生成模式 | main(v4) | 差值 |
| --- | --- | --- | --- |
| 总文件 | 64 | 64 | 0 |
| 原始总体积 | 1.32 MiB | 1.32 MiB | +894 B |
| CSS 文件 | 14 | 14 | 0 |
| CSS 原始体积 | 152.6 KiB | 152.2 KiB | +419 B |
| JS 文件 | 17 | 17 | 0 |
| 规范化聚合 Hash | 79a853c6a411 | 5661cd07def1 | - |

## CSS 质量指标

| 项 | v5 生成模式 | main(v4) |
| --- | --- | --- |
| 规则/选择器等 | 规则 2884，选择器 2931，!important 2，@media 0，@supports 0，@layer 0，CSS 变量 134 | 规则 2884，选择器 2931，!important 2，@media 0，@supports 0，@layer 0，CSS 变量 134 |

## 规范化后差异分类

| 类型 | 总数 | 变更 | 新增 | 删除 |
| --- | ---: | ---: | ---: | ---: |
| 脚本 | 31 | 3 | 14 | 14 |
| 样式 | 27 | 1 | 13 | 13 |
| SourceMap | 19 | 3 | 8 | 8 |
| 模板 | 19 | 1 | 9 | 9 |
| 配置/描述 | 18 | 2 | 8 | 8 |

## 产物文件明细

| 类型 | 分类 | 文件 | v5 原始字节/规范化Hash | main(v4) 原始字节/规范化Hash |
| --- | --- | --- | --- | --- |
| 变更 | 脚本 | `dist/wx/app.js` | 14166 / c7020119ff95 | 14165 / 741f9dccb862 |
| 变更 | SourceMap | `dist/wx/app.js.map` | 49038 / fad0457ad119 | 49038 / f78352e3b6ca |
| 变更 | 样式 | `dist/wx/app.wxss` | 125 / b4b198cd0bdd | 125 / c5e262eba3bc |
| 变更 | 脚本 | `dist/wx/bundle.js` | 181851 / 67b4ef240aff | 181826 / e1b2b4c7824b |
| 变更 | SourceMap | `dist/wx/bundle.js.map` | 877046 / 46822dc4995c | 877046 / a3625b84365c |
| 新增 | 脚本 | `dist/wx/components/list567f1c84/index.js` | 1020 / ef11fab21c14 | - |
| 新增 | SourceMap | `dist/wx/components/list567f1c84/index.js.map` | 3640 / 770c1ef65a1c | - |
| 新增 | 配置/描述 | `dist/wx/components/list567f1c84/index.json` | 18 / 3cac147888c7 | - |
| 新增 | 模板 | `dist/wx/components/list567f1c84/index.wxml` | 229 / 811d8fee7dfc | - |
| 新增 | 样式 | `dist/wx/components/list567f1c84/index.wxss` | 0 / 01ba4719c80b | - |
| 删除 | 脚本 | `dist/wx/components/list750254b0/index.js` | - | 1020 / 6438145983c8 |
| 删除 | SourceMap | `dist/wx/components/list750254b0/index.js.map` | - | 3640 / d027cf27e25d |
| 删除 | 配置/描述 | `dist/wx/components/list750254b0/index.json` | - | 18 / 3cac147888c7 |
| 删除 | 模板 | `dist/wx/components/list750254b0/index.wxml` | - | 229 / 2837ed06b2d6 |
| 删除 | 样式 | `dist/wx/components/list750254b0/index.wxss` | - | 0 / 01ba4719c80b |
| 新增 | 脚本 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.js` | 3418 / d323e7e28df1 | - |
| 新增 | SourceMap | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.js.map` | 9292 / d2b3fa7531d9 | - |
| 新增 | 配置/描述 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.json` | 235 / 0c82b4ba98dc | - |
| 新增 | 模板 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.wxml` | 2383 / 486102259d4e | - |
| 新增 | 样式 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/button/button.wxss` | 23031 / da78f8ed08b6 | - |
| 新增 | 脚本 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.js` | 1637 / c791c48fa1d7 | - |
| 新增 | SourceMap | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.js.map` | 5206 / f4d8837457e9 | - |
| 新增 | 配置/描述 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.json` | 71 / 1abd7a519afa | - |
| 新增 | 模板 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.wxml` | 583 / 77a6d379e7e0 | - |
| 新增 | 样式 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/icon/icon.wxss` | 107397 / 5c0c187b186a | - |
| 新增 | 脚本 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.js` | 1709 / 34c5aa41779b | - |
| 新增 | SourceMap | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.js.map` | 5347 / 80751832edba | - |
| 新增 | 配置/描述 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.json` | 71 / 1abd7a519afa | - |
| 新增 | 模板 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.wxml` | 1970 / 7fbe0b622ea3 | - |
| 新增 | 样式 | `dist/wx/components/tdesign-miniprogram4d583804/miniprogram_dist/loading/loading.wxss` | 3552 / 6793e15e05ff | - |
| 删除 | 脚本 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.js` | - | 3415 / 80f5b1c8b976 |
| 删除 | SourceMap | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.js.map` | - | 9248 / 95d502ad4098 |
| 删除 | 配置/描述 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.json` | - | 235 / 8430ca6f71f8 |
| 删除 | 模板 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.wxml` | - | 2383 / 3d0ce36befae |
| 删除 | 样式 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/button/button.wxss` | - | 23031 / d9cf13ab3946 |
| 删除 | 脚本 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.js` | - | 1637 / 797d1e45358a |
| 删除 | SourceMap | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.js.map` | - | 5162 / 9b62f237c71d |
| 删除 | 配置/描述 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.json` | - | 71 / 1abd7a519afa |
| 删除 | 模板 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.wxml` | - | 583 / 2632aa51ea53 |
| 删除 | 样式 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/icon/icon.wxss` | - | 107397 / f5cbe826633c |
| 删除 | 脚本 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.js` | - | 1707 / 78d229109176 |
| 删除 | SourceMap | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.js.map` | - | 5303 / 3efa4a672b7a |
| 删除 | 配置/描述 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.json` | - | 71 / 1abd7a519afa |
| 删除 | 模板 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.wxml` | - | 1970 / deb49a8f1339 |
| 删除 | 样式 | `dist/wx/components/tdesign-miniprogram4f947930/miniprogram_dist/loading/loading.wxss` | - | 3552 / c9e25b44ba48 |
| 删除 | 脚本 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.js` | - | 3687 / 5b91aebb4ed4 |
| 删除 | SourceMap | `dist/wx/components/vant/weapp593d09f6/lib/button/index.js.map` | - | 12490 / 3d2ef4551aad |
| 删除 | 配置/描述 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.json` | - | 162 / 27baa94d2f5c |
| 删除 | 模板 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.wxml` | - | 1889 / 3c995e13a89b |
| 删除 | 样式 | `dist/wx/components/vant/weapp593d09f6/lib/button/index.wxss` | - | 3538 / 4e0828f003b6 |
| 删除 | 脚本 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.js` | - | 864 / a78baa63637d |
| 删除 | SourceMap | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.js.map` | - | 3186 / c7573022ef55 |
| 删除 | 配置/描述 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.json` | - | 97 / 9f7e4c71d7b5 |
| 删除 | 模板 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.wxml` | - | 446 / a3d19f5fe130 |
| 删除 | 样式 | `dist/wx/components/vant/weapp593d09f6/lib/icon/index.wxss` | - | 11599 / b12bf5bb8123 |
| 删除 | 脚本 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.js` | - | 717 / 64a5494f9eda |
| 删除 | SourceMap | `dist/wx/components/vant/weapp593d09f6/lib/info/index.js.map` | - | 2593 / f1ec5ddc62a5 |
| 删除 | 配置/描述 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.json` | - | 18 / 3cac147888c7 |
| 删除 | 模板 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.wxml` | - | 242 / 0cec02c08c43 |
| 删除 | 样式 | `dist/wx/components/vant/weapp593d09f6/lib/info/index.wxss` | - | 830 / cbd550375b04 |
| 删除 | 脚本 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.js` | - | 808 / 53a53c23730c |
| 删除 | SourceMap | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.js.map` | - | 2947 / b97e711986c7 |
| 删除 | 配置/描述 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.json` | - | 18 / 3cac147888c7 |
| 删除 | 模板 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.wxml` | - | 540 / f993b1c4b7c2 |
| 删除 | 样式 | `dist/wx/components/vant/weapp593d09f6/lib/loading/index.wxss` | - | 2136 / f118f650382f |
| 新增 | 脚本 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.js` | 3687 / e9e24895305a | - |
| 新增 | SourceMap | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.js.map` | 12534 / 5954b63d2e5c | - |
| 新增 | 配置/描述 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.json` | 162 / c99bb9c1bff2 | - |
| 新增 | 模板 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.wxml` | 1889 / 6fe898cc7dc3 | - |
| 新增 | 样式 | `dist/wx/components/vant/weappda3e1e6c/lib/button/index.wxss` | 3538 / a4dec020052c | - |
| 新增 | 脚本 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.js` | 868 / 293e613bb382 | - |
| 新增 | SourceMap | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.js.map` | 3230 / e2209fdb7ccb | - |
| 新增 | 配置/描述 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.json` | 97 / ad6007081e85 | - |
| 新增 | 模板 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.wxml` | 446 / 3dfbb133f765 | - |
| 新增 | 样式 | `dist/wx/components/vant/weappda3e1e6c/lib/icon/index.wxss` | 11599 / b1236cf37086 | - |
| 新增 | 脚本 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.js` | 717 / 7d8f4021bdf7 | - |
| 新增 | SourceMap | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.js.map` | 2637 / b2610658f6b8 | - |
| 新增 | 配置/描述 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.json` | 18 / 3cac147888c7 | - |
| 新增 | 模板 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.wxml` | 242 / a2c91e7b1893 | - |
| 新增 | 样式 | `dist/wx/components/vant/weappda3e1e6c/lib/info/index.wxss` | 830 / 798097e2b220 | - |
| 新增 | 脚本 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.js` | 809 / d823ab6542bd | - |
| 新增 | SourceMap | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.js.map` | 2991 / 5dac86b222e4 | - |
| 新增 | 配置/描述 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.json` | 18 / 3cac147888c7 | - |
| 新增 | 模板 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.wxml` | 540 / 76fc644b7982 | - |
| 新增 | 样式 | `dist/wx/components/vant/weappda3e1e6c/lib/loading/index.wxss` | 2136 / 2386d1144ff2 | - |
| 变更 | 配置/描述 | `dist/wx/outputMap.json` | 3135 / 0ac1eccfd607 | 3002 / 196cef4f44de |
| 变更 | 脚本 | `dist/wx/pages/index.js` | 1573 / b0bf0d90ff1b | 1575 / a76e763edac4 |
| 变更 | SourceMap | `dist/wx/pages/index.js.map` | 4560 / f76081c3008d | 4560 / b6bb8ec50895 |
| 变更 | 配置/描述 | `dist/wx/pages/index.json` | 208 / 870122e84165 | 208 / 184095a9c5ce |
| 变更 | 模板 | `dist/wx/pages/index.wxml` | 629 / 583875d7b157 | 629 / 557cfe1967b7 |
| 新增 | 样式 | `dist/wx/styles/base487e0d61.wxss` | 1528 / 8b311aff13b4 | - |
| 删除 | 样式 | `dist/wx/styles/base55ac6296.wxss` | - | 1272 / e83fdac40abf |
| 删除 | 样式 | `dist/wx/styles/components4695ad8c.wxss` | - | 0 / 01ba4719c80b |
| 新增 | 样式 | `dist/wx/styles/components63da9234.wxss` | 0 / 01ba4719c80b | - |
| 新增 | 样式 | `dist/wx/styles/index0af78c53.wxss` | 163 / 6b42ce66d184 | - |
| 删除 | 样式 | `dist/wx/styles/index97c4e6b2.wxss` | - | 163 / 6b42ce66d184 |
| 新增 | 样式 | `dist/wx/styles/index9a27da9c.wxss` | 1180 / 970995a6f7d4 | - |
| 删除 | 样式 | `dist/wx/styles/indexb6747a44.wxss` | - | 1180 / 970995a6f7d4 |
| 新增 | 样式 | `dist/wx/styles/utilities3d066604.wxss` | 1225 / 464c4b153a2b | - |
| 删除 | 样式 | `dist/wx/styles/utilities6c3b4da0.wxss` | - | 1062 / 448b0229eb5e |
| 删除 | 模板 | `dist/wx/template/icon70cef32c.wxml` | - | 314 / 245fb4522376 |
| 新增 | 模板 | `dist/wx/template/icon7927b7d8.wxml` | 314 / 245fb4522376 | - |
| 删除 | 脚本 | `dist/wx/wxs/index0c69d688.wxs` | - | 3760 / 3508b2ab4f05 |
| 新增 | 脚本 | `dist/wx/wxs/index4793fe18.wxs` | 3690 / 1b444631691c | - |
| 删除 | 脚本 | `dist/wx/wxs/index4af25bfa.wxs` | - | 4099 / 425e8ef73c48 |
| 删除 | 脚本 | `dist/wx/wxs/index63e09dc0.wxs` | - | 3690 / 1b444631691c |
| 新增 | 脚本 | `dist/wx/wxs/index7f1d0b30.wxs` | 3760 / 3508b2ab4f05 | - |
| 新增 | 脚本 | `dist/wx/wxs/index8eba9aa2.wxs` | 4099 / 425e8ef73c48 | - |
| 删除 | 脚本 | `dist/wx/wxs/stringify1330db56.wxs` | - | 7043 / 4003a104a147 |
| 新增 | 脚本 | `dist/wx/wxs/stringify6c96c029.wxs` | 7043 / 4003a104a147 | - |
| 删除 | 脚本 | `dist/wx/wxs/utils00fd38f5.wxs` | - | 4480 / 9cacaf46aff2 |
| 新增 | 脚本 | `dist/wx/wxs/utils3b6c8d5d.wxs` | 4690 / d7e8bdfbb184 | - |
| 删除 | 脚本 | `dist/wx/wxs/utils64998389.wxs` | - | 4690 / d7e8bdfbb184 |
| 新增 | 脚本 | `dist/wx/wxs/utilsc666da6e.wxs` | 4480 / 9cacaf46aff2 | - |

