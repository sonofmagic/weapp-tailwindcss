vite@^2.8.3:

postcss@^8.1.10, postcss@^8.4.6:

postcss.config.js 不能正常加载？

调试后发现添加 `postcss.config.js` 不起作用，无法直接添加进 `vite config`，直接更改 `vite.config.ts` 了

`'@dcloudio/vite-plugin-uni'` 内置 `uni-app` `autoprefixer` postcss 插件

`'@dcloudio/uni-cli-shared'` -> `src/postcss/index.ts`

`@dcloudio/uni-app-vite` `uni-app-vite/src/plugin/index` 添加的 `initPostcssPlugin`

`@dcloudio/uni-app-plus` 引入 '@dcloudio/uni-app-vite'

`@dcloudio/uni-app-vite` 引入 `@dcloudio/uni-app-plus` 中的文件内容 `fs` 引用 `dist` and `css`

`uni-app-vite` `export Plugin[]`

`uni-app-plus` import as compiler

'@dcloudio/vite-plugin-uni' 动态引入 `@dcloudio/uni-app-plus`

`vite-plugin-uni` 注册 bin `uni`: "bin/uni.js"

`resolveConfig` 获取的 postcss 是一个字符串路径

`postcssrc` -> `postcss-load-config` -> `resolvePostcssConfig`

`loadConfigFromFile`

`bundleConfigFile`

`loadConfigFromBundledFile` -> `userConfig#plugins#18 length`

`config.css.postcss#String`

`debug` `uni-app-vite/src/plugin/index#uniAppPlugin`

### vite 3

uni-cli-shared/json/manifest.js 中的 parseRpx2UnitOnce

通过 platform 获取转义配置项

platform === 'h5' || platform === 'app' 为

```js
const defaultRpx2Unit = {
    unit: 'rem',
    unitRatio: 10 / 320,
    unitPrecision: 5,
};
```

其他为

```js
const defaultMiniProgramRpx2Unit = {
    unit: 'rpx',
    unitRatio: 1,
    unitPrecision: 1,
};
```

回到 uni-cli-shared/postcss

顺着代码找到 `plugins/uniapp`

walkDecls 可以看到 rpx 被转换成了 rem
