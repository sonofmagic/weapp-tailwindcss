# Changelog

## 1.6.5 (2022-06-19)

### Improvement

- 优化 `ts` 生成的 `.d.ts` 文件的 `npm` 包索引。

## 1.6.4 (2022-06-11)

### Fixed
[issues/53](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/53) 在`BaseJsxWebpackPlugin`的新文件开始处理前强制重置`replacer`状态。(Thanks to [sandro-qiang](https://github.com/sandro-qiang))

## 1.6.2 (2022-06-10)

## Improvement
- 优化被分割的 `vite`,`postcss` 的 `d.ts` 智能提示

## 1.6.1 (2022-06-08)

## Improvement
- 优化 `Tree-shaking` ，减小`npm`包打包体积

## 1.6.0 (2022-06-08)

### Fixed
[issues/50](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/50) `vite` 插件依赖 `webpack` 问题

### Breaking change
`vite` 引入插件的方式，改为:
```js
import vwt from 'weapp-tailwindcss-webpack-plugin/vite';
import postcssWeappTailwindcssRename from 'weapp-tailwindcss-webpack-plugin/postcss';
```
详见 [vite.config.ts](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-vue3-vite/vite.config.ts)

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


