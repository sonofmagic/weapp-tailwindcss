# @weapp-tailwindcss/postcss

> [English](./README.md) | 简体中文

这个包是 weapp-tailwindcss 的 CSS 处理核心，负责小程序端的 PostCSS AST 转换、选择器兼容、平台差异处理和 Tailwind 输出后处理。

## 批量 CSS 比较

对同一份 CSS 连续比较时，`createCssRuleMatcher(baseCss)` 提供 `contains(css)` 和 `filter(css)`，按需构建并复用比较索引，语义与 `containsCssAfterMinify`、`filterExistingCssRules` 相同。主样式变化后应创建新的 matcher，批量比较结束后释放引用。

## 官网

更多接入方式、配置说明和框架示例见 [weapp-tailwindcss 官方文档](https://tw.weapp.dev)。
