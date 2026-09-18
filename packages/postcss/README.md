# @weapp-tailwindcss/postcss

> English | [简体中文](./README.zh-CN.md)

This package is the CSS processing core of weapp-tailwindcss. It handles PostCSS AST transforms, selector compatibility, platform differences, and Tailwind output post-processing for mini programs.

## Repeated CSS Comparisons

For repeated comparisons against one CSS string, `createCssRuleMatcher(baseCss)` provides `contains(css)` and `filter(css)` with reusable, lazy comparison indexes. It preserves the semantics of `containsCssAfterMinify` and `filterExistingCssRules`. Create a new matcher when the base CSS changes; release it after the batch.

## Native compiler

The isolated `@weapp-tailwindcss/postcss/native` entry provides `compileNativeCss(css, options)` for CSS-to-native style translation. It returns rules, variables, and warnings. React Native manifest IDs, Tailwind generation, and runtime integration remain in `@weapp-tailwindcss/react-native`; importing its `/runtime` entry does not load this compiler.

## Website

For setup guides, configuration references, and framework examples, see the [official weapp-tailwindcss documentation](https://tw.weapp.dev).
