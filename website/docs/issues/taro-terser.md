# `Tarojs` 中使用 `terser-webpack-plugin` 

在 `taro` `webpack5` 环境下，这个插件和外置额外安装的 `terser-webpack-plugin` 一起使用，会导致插件转义功能失效

相关 issue：[#142](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/142)

## 现象

例如：`.h-4/6`、`!w-full` 正常会转义为`.h-4s6`、`.iw-full`，本插件失效后小程序开发者工具报编译错误 `.h-4\/6`、`.\!w-full`。

## 解决方案

请压缩代码并不要使用[链接](https://docs.taro.zone/docs/config-detail/#terserenable)中的方法，太老旧了。

使用 `taro` 配置项里的的 `terser` 配置项，参见 [`terser` 配置项](https://docs.taro.zone/docs/config-detail#terser)。

> `terser` 配置只在生产模式下生效。如果你正在使用 `watch` 模式，又希望启用 `terser`，那么则需要设置 `process.env.NODE_ENV` 为 `production`。

也就是说，直接在开发 `watch` 模式的时候，设置环境变量 `NODE_ENV` 为 `production` 就行。

另外也可以不利用 `webpack` 插件压缩代码，去使用微信开发者工具内部的压缩代码选项。
