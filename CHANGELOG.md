# Changelog

## 1.9.3 (2022-09-22)

### Features

- 以模板为主的 `uni-app`,`mina`等等的 `wxml` 变量处理方式，当遇到二元运算符时，忽略运算符中，字符串字面量的转义。

## 1.9.2 (2022-09-10)

### Fixed

- `tailwindcss` 伪元素 `jit` 的自定义特殊字符。

### Chore

- 重构重命名核心方法，为 `v2` 做准备。

## 1.9.1 (2022-09-08)

### Features

- `vite` 插件，可以直接注册，不需要再引入 `postcss` 插件

### Chore

- 暂时去除 `mangle` 配置
- 去除 `lodash.groupby` 引用，减少包的体积

## 1.9.0 (2022-09-05)

### Features

- 添加 `mangle` 配置，用于压缩混淆 `className`，详见 [mangle.md](./docs/mangle.md)
- 重构 `transformSync`， 废弃 `mpRulePreflight`
- `weapp-tailwindcss-webpack-plugin/replacer` 额外暴露 `replaceEscapedCss`
- 暴露 `weapp-tailwindcss-webpack-plugin/mangle` 插件

## 1.8.1 (2022-08-22)

### Fixed

- [using-arbitrary-variants](https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants) 自定义选择器类名支持与修复 [[#84](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/84)]

## 1.8.0 (2022-08-17)

### Features

- 添加 `tailwindcss` 默认伪元素的 `--tw-content` 变量初始值
- 依赖处理方式改变，`postcss` 和 `postcss-selector-parser` 从编译时打入，变为安装时连带
- 精细化的移除选择器，当发现不支持的伪类选择器时，原先的策略是把 `Rule` 整个移除，现在会遍历这个 `Rule` 的所有选择器，只把不支持的选择器的移除，当且仅当所有的选择器都被移除时，这个 `Rule` 才被整个移除

### Fixed

- 修复 `vite` 版本 `tailwindcss` 默认注入变量选择器 `undefined` 的问题

## 1.7.3 (2022-08-15)

### Features

- 允许用户使用 `replaceUniversalSelectorWith` 选项来自定义`css`全局选择器`*`的替换值 [issue[#81](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/81)]

## 1.7.2 (2022-08-15)

### Fixed

- 修复在伪元素中使用`*`自动被替换的问题 [#79](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/79)

### Chore

- 更改转义字典表，添加 `*`，`\\`和 `"` 的默认转义，规范化以前转义生成的`_[code]_`。

## 1.7.1 (2022-08-06)

### Chore

- 更新打包成`app`文档和模板选择文档
- 依赖更新

## 1.7.0 (2022-08-04)

### Features

- 支持 `taro 3.5`，用法如下：

简单修改 Taro 的编译配置即可切换使用 Webpack4 或 Webpack5 进行编译：

```js
/** config/index.js */
const config = {
  // 自定义编译工具，可选 'Webpack4' 或 'Webpack5'
  compiler: 'webpack5'
}
```

其中:

- `Webpack4` 使用 `TaroWeappTailwindcssWebpackPluginV4` 进行注册
- `Webpack5` 使用 `TaroWeappTailwindcssWebpackPluginV5` 进行注册

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

## 1.4.3 (2022-05-18)

## 1.4.0 (2022-05-15)

Breaking change: handle `wxml` with `regex` instead of `wxml-ast` [issues/38](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/38).
