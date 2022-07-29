# Changelog

## 1.6.9 (2022-07-29)

### Features

- 添加 `disabled` 配置项，用来表示是否禁用该插件，默认为 `false`，一般用于多平台构建，有些平台比如 `h5` 不需要开启此插件，所以可以根据环境变量进行禁用。  
- `onUpdate` 这个生命周期 `hook` 增加传入参数，即编译前的 `rawSource` 和 编译后的 `newSource` 作为第二和第三个参数，用于插件调试和文件内容比较。

### Docs & Demos

- 添加 `HBuilderX` 创建的项目的[使用方式](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template#readme) 和 [Demo 项目](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template)

## 1.6.8 (2022-07-01)

### Features

- 添加 `cssPreflightRange` 配置项 [pull/62](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/pull/62)，用来限制全局选择器影响的 `dom` 范围，从而增加或者减少  `cssPreflight` 注入的 `dom`，具体的使用方式见 `README.md`

## 1.6.7 (2022-06-22)

### Features

- 不再锁定 `@babel/*` 的具体版本

### Fixed

- 修复 `remax` 版本的 `hoverClassName` 不处理的问题。(`remax`命名比较特殊)

## 1.6.6 (2022-06-21)

### Features

- 添加 `tailwindcss` 的 `dark mode` (media) 支持。
- 现在 `uni-app` 和 `taro` 都会同时转义 `class` 和 `hover-class` 里的内容了 [uni-app-vite-vue3-tailwind-vscode-template/issues/3](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template/issues/3)。

### Fixed

- 修复 `taro vue3` 版本 `babel` 处理导致打包失败的问题。

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


