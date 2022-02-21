vite@^2.8.3:

postcss@^8.1.10, postcss@^8.4.6:

postcss.config.js 不能正常加载？

调试后发现添加 `postcss.config.js` 不起作用，无法直接添加进 `vite config`，直接更改 `vite.config.ts` 了

`'@dcloudio/vite-plugin-uni'` 内置 `uni-app` `autoprefixer` postcss 插件
