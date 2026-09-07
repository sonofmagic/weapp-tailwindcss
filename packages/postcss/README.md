# @weapp-tailwindcss/postcss

> English | [简体中文](./README.zh-CN.md)

This package is the CSS processing core of weapp-tailwindcss. It handles PostCSS AST transforms, selector compatibility, platform differences, and Tailwind output post-processing for mini programs.

## Repeated CSS Comparisons

For repeated comparisons against one CSS string, `createCssRuleMatcher(baseCss)` provides `contains(css)` and `filter(css)` with reusable, lazy comparison indexes. It preserves the semantics of `containsCssAfterMinify` and `filterExistingCssRules`. Create a new matcher when the base CSS changes; release it after the batch.

## Website

For setup guides, configuration references, and framework examples, see the [official weapp-tailwindcss documentation](https://tw.weapp.dev).
