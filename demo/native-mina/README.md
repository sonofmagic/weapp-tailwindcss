# 简介

此`demo`为配置好的项目，可直接在 `webpack.config.js`，取代 `require('../../')` 为 `require('weapp-tailwindcss-webpack-plugin')` 后使用。

或者直接使用我的 `fork` 版本 [`sonofmagic/MyMina`](https://github.com/sonofmagic/MyMina)

## 此项目和 [`listenzz/MyMina`](https://github.com/listenzz/MyMina) 的不同点

- 摒弃了 `node-sass`，改用了 `dart-sass`
- 摒弃了 `moment`，改用了 `dayjs`
- 添加了 `postcss8` 和 `tailwindcss` 支持

## 为什么运行不起来？

这个是因为 `native-mina` 是一个原生小程序项目，里面安装了 `@vant/weapp` 这个原生控件库，
这是需要在 `微信开发者工具`，点击 `工具` -> `构建 npm`，并勾选 `使用 npm 模块` 选项，然后进行构建，完成后，才可以运行。
详见： <https://vant-contrib.gitee.io/vant-weapp/#/quickstart>

<https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/116>
