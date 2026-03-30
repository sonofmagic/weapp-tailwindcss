# Webpack Demo Style Loader Orders

以下内容概览 demo 目录中所有基于 Webpack 的子项目，逐一列出样式相关 loader 的执行顺序以及配置来源（按 Webpack 实际执行顺序，即“数组尾部 loader 先执行”）。`
` 表示同一条规则的连续 loader。

## Taro 系列（taro-app / taro-vue3-app / taro-webpack-tailwindcss-v4）
- **核心实现**：`demo/taro-app/node_modules/@tarojs/webpack5-runner/dist/webpack/MiniWebpackModule.js`
- `getCSSLoaders`（行 101-157）定义基础栈：`MiniCssExtractPlugin.loader → css-loader → postcss-loader`，并在启用 CSS Modules 时换成带模块配置的 css-loader。
- `addCSSLoader`（行 92-99）会克隆上述栈并在尾部追加预处理器：
  - `scss`/`sass`：`… → resolve-url-loader → sass-loader`（行 34-42）。
  - `less`：`… → less-loader`（行 43-46）。
  - `stylus`：`… → stylus-loader`（行 47-50）。
- 结果：任意样式都会先被对应的预处理器处理，再经过 PostCSS，最后交给 `MiniCssExtractPlugin` 输出 `.wxss`。

## Mpx 系列（mpx-app / mpx-tailwindcss-v4）
- **基础栈**：继承 Vue CLI（`demo/mpx-app/node_modules/@vue/cli-service/lib/config/css.js:99-194`）
  - 默认顺序：`MiniCssExtractPlugin.loader`（或 `vue-style-loader`）`→ css-loader → (cssnano 可选) → postcss-loader → 预处理器`。
- **Mpx 注入**：`demo/mpx-app/node_modules/@mpxjs/webpack-plugin/lib/index.js:1883-2042`
  - `typeLoaderProcessInfo.styles` 定义了 `css-loader → @mpxjs/wxss/loader → @mpxjs/style-compiler` 的串联，并在 `injectStyleStripLoader` 里确保条件编译 loader 紧跟在 `stylus/sass/less/css/wxss` 之后。
  - 对 `.mpx` 模块的样式来说，整体顺序为：`MiniCssExtractPlugin.loader → css-loader（被替换为 wxss-loader）→ @mpxjs/wxss/loader → @mpxjs/style-compiler → postcss-loader → 预处理器`。

## Uni-app（classic vue2 / webpack，已不推荐）
- **链路**：`node_modules/@dcloudio/vue-cli-plugin-uni/lib/chain-webpack.js:40-146`
  - 每个 `cssLang` 的 `oneOf` 均执行 `css-loader → extract-css-loader（非 H5 平台）→ uniapp-preprocess → postcss-loader → 预处理器`。
  - 若启用了缓存，则在 `css-loader` 之前自动插入 `cache-loader`；`uniapp-preprocess` 会在 `css-loader`、预处理器前后各执行一次条件编译。
- H5 进一步在 `lib/h5/cssnano-options.js` 中为每种 `rule(oneOf)` 加上 `postcss-loader(cssnano)`，次序保持不变。

## 说明
- `uni-app-tailwindcss-v4` / `taro-app-vite` 等 Vite 工程不在本文范围。
- 需要查看 loader 以外的 patch（例如 `UnifiedWebpackPluginV5` 注入的 runtime loader）时，可结合 `packages/weapp-tailwindcss/src/bundlers/webpack/BaseUnifiedPlugin`。
