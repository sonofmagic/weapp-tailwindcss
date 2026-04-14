---
'@weapp-tailwindcss/postcss': minor
---

新增 PostCSS 流水线按需裁剪能力，通过轻量级 CSS 内容探测自动跳过不必要的插件。

- 新增 `content-probe` 模块，使用正则/字符串匹配快速探测 CSS 内容特征（现代颜色函数、preset-env 特征等）。
- `createStylePipeline` 支持可选的 `FeatureSignal` 参数，根据信号按需跳过 `postcss-preset-env` 和 `color-functional-fallback` 插件。
- `StyleProcessorCache` 将特征信号纳入缓存键计算，确保不同内容特征组合使用正确的处理器。
- `createStyleHandler` 自动执行内容探测并传递信号，对外 API 签名不变，零配置即可获得优化。
- 探测策略采用宽松匹配：宁可误报（多加载插件），不可漏报（遗漏需要的插件），确保处理结果等价。
