# Webpack Demo Loader Execution Orders

说明：Webpack 会按照 `module.loaders` / `rule.use` **从后往前**执行 loader。以下顺序均按“执行时的先后”列出，并特别标出 `postcss-loader`、`runtimeCssImportRewriteLoader`、`runtimeClassSetLoader` 所处位置。

## native-mina
- 路径：`demo/native-mina/webpack.config.js`
- 执行序：`sass-loader → runtimeCssImportRewriteLoader → postcss-loader → runtimeClassSetLoader → file-loader`
  - rewrite 在 PostCSS 之前；class-set 在 PostCSS 之后。

## taro-app / taro-vue3-app / taro-webpack-tailwindcss-v4
- 路径：`demo/taro-app/node_modules/@tarojs/webpack5-runner/dist/webpack/MiniWebpackModule.js`
- 基础执行序：`preprocessor (sass/less/stylus) → runtimeCssImportRewriteLoader → postcss-loader → runtimeClassSetLoader → css-loader → MiniCssExtractPlugin.loader`
  - 架构中的 `MiniCssExtractPlugin.loader → css-loader → postcss-loader` 的定义位于 `getCSSLoaders`，rewrite 和 class-set 分别在它们两侧。

## mpx-app / mpx-tailwindcss-v4
- 路径：
  - Vue CLI loader 链：`demo/mpx-app/node_modules/@vue/cli-service/lib/config/css.js`
  - Mpx 注入：`demo/mpx-app/node_modules/@mpxjs/webpack-plugin/lib/index.js`
- 执行序（含 Mpx 注入后）：`preprocessor → runtimeCssImportRewriteLoader → postcss-loader → runtimeClassSetLoader → css-loader (被 wxss-loader 取代) → @mpxjs/wxss/loader → @mpxjs/style-compiler → MiniCssExtractPlugin.loader`
  - rewrite 依旧在 `postcss-loader` 之前，class-set 在之后；Mpx 自身的 `wxss/style compiler` 仍保持在 css-loader 之后。

## Uni-app (uni-app / uni-app-webpack5 / uni-app-webpack-tailwindcss-v4)
- 路径：`demo/uni-app/node_modules/@dcloudio/vue-cli-plugin-uni/lib/chain-webpack.js`
- 执行序：`preprocessor → runtimeCssImportRewriteLoader → postcss-loader → runtimeClassSetLoader → uniapp-preprocess (postcss 后再次注入) → css-loader → extract-css-loader / vue-style-loader`
  - 在原链路中 `uniapp-preprocess` 会在 `css-loader` 前插入一次；rewrite/class-set 的插入仍然围绕 `postcss-loader` 对称。

## Rax 示例（rax-app）
- 路径：`demo/rax-app/node_modules/.pnpm/node_modules/build-plugin-rax-app/lib/userConfig/atoms/inlineStyle.js`
- MiniApp 目标默认执行序：`preprocessor → runtimeCssImportRewriteLoader → postcss-loader → runtimeClassSetLoader → css-loader → MiniCssExtractPlugin.loader`
  - 若 `inlineStyle` 强制开启，则 html/inline rule 会走 `preprocessor → runtimeCssImportRewriteLoader → postcss-loader → stylesheet-loader`（class-set 仍在 PostCSS 后）。

> 备注：`runtimeCssImportRewriteLoader` 和 `runtimeClassSetLoader` 是全局注入的 runtime loader，只有在 Tailwind v4 且启用 rewrite 时才会-visible；其位置在所有 demo 中都遵循“rewrite-before-postcss / class-set-after-postcss”这一策略。
