# Changelog

## 1.5.0 (2022-06-01)

### Fixed
[issues/48](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/48) Source map 指向错误问题. 

### Breaking change

更改了兼容 `webpack 4/5` 的 `react` 版本插件的实现。原先是对 `webpack` `emit` 后的产物进行分析和替换，现在新的实现为: 动态创建一个新的 `jsx-rename-loader`，它运行在 `babel-loader` 之后，对 `babel-loader` 的产物进行替换。这样最终生成的 `Source map` 就不会存在指向错误问题了。

收到影响的 `Plugin`:
- **taro react** : `TaroWeappTailwindcssWebpackPluginV4`
- **rax react** : `RaxTailwindcssWebpackPluginV5`
- **remax react** : `RemaxWeappTailwindcssWebpackPluginV4`

## 1.4.4 (2022-05-19)

[Feat]: `all arbitrary values usages`, 允许 `before:content-['Festivus']` 这样的写法。

## 1.4.3 (2022-05-18)

[Fixed]: `shadow arbitrary-values` 问题: 比如使用 `shadow-[0px_2px_11px_0px_rgba(0,0,0,0.4)]` 会报错等等
## 1.4.0 (2022-05-15)

Breaking change: handle `wxml` with `regex` instead of `wxml-ast` [issues/38](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/38).


