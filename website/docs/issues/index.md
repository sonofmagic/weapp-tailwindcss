# 常见问题

## 为什么我更改了 class 保存重新打包的时候热更新失效？

[[#93](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/93)]

目前微信开发者工具会默认开启代码自动热重载 `compileHotReLoad` 功能，这个功能在原生开发中表现良好，但在 `uni-app` 和 `taro` 等的框架中，存在一定的问题，参见 [issues#37](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/37)，所以如果你遇到了此类问题，建议关闭 `compileHotReLoad` 功能。

## `disabled:opacity-50` 这类的 `tailwindcss` 工具类不生效?

这是由于微信小程序 `wxss` 选择器的原生限制，无法突破。参见 [issue#33](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/33)。

## 和原生组件一起使用注意事项

假如出现原生组件引入报错的情况，可以参考 [issue#35](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/35)，忽略指定目录下的文件，跳过插件处理，例如 `uni-app` 中的 `wxcomponents`。

如何更改？在传入的配置项 `cssMatcher`，`htmlMatcher` 这类配置，来过滤指定目录或文件。

## 编译到 h5 / app 注意事项

有些用户通过 `uni-app` 等跨端框架，不止开发成各种小程序，也开发为 `H5`，然而 `tailwindcss` 本身就兼容 `H5` 了。此时你需要更改配置，我们以 `uni-app` 为例:

```js
const isH5 = process.env.UNI_PLATFORM === "h5";
// vue3 版本构建到 app, UNI_PLATFORM 的值为 app
// vue2 版本为 app-plus
const isApp = process.env.UNI_PLATFORM === "app-plus";
const WeappTailwindcssDisabled = isH5 || isApp;


// 然后在 h5 和 app 环境下把 webpack plugin 和 postcss for weapp 给禁用掉
// 我们以 uni-app-vue3-vite 这个 demo为例
// vite.config.ts
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from "weapp-tailwindcss-webpack-plugin/vite";
// vite 插件配置
const vitePlugins = [uni(),uvtw({
  disabled: WeappTailwindcssDisabled
})];

export default defineConfig({
  plugins: vitePlugins
});

// 同理 postcss 配置
// 假如不起作用，请使用内联postcss
const plugins = [require('autoprefixer')(), require('tailwindcss')()];

if (!WeappTailwindcssDisabled) {
  plugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  );
}

module.exports = {
  plugins
};
```

## 报错 TypeError: Cannot use 'in' operator to search for 'CallExpression' in undefined

遇到这个问题是由于 `babel` 相关的包之间的版本产生了冲突导致的，这种时候可以删除掉 `lock` 文件（`yarn.lock`、`pnpm-lock.yaml`、`package-lock.json`），然后重新安装即可。

## taro webpack5 环境下，这个插件和外置额外安装的 `terser-webpack-plugin` 一起使用，会导致插件转义功能失效

相关 issue：[#142](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/142)

例如：`.h-4/6`、`!w-full` 正常会转义为`.h-4s6`、`.iw-full`，本插件失效后小程序开发者工具报编译错误 `.h-4\/6`、`.\!w-full`。

请压缩代码并不要使用[链接](https://docs.taro.zone/docs/config-detail/#terserenable)中的方法，太老旧了。

使用 `taro` 配置项里的的 `terser` 配置项，参见 [`terser` 配置项](https://taro-docs.jd.com/docs/config-detail#terser)。

> `terser` 配置只在生产模式下生效。如果你正在使用 `watch` 模式，又希望启用 `terser`，那么则需要设置 `process.env.NODE_ENV` 为 `production`。

也就是说，直接在开发 `watch` 模式的时候，设置环境变量 `NODE_ENV` 为 `production` 就行。

另外也可以不利用 `webpack` 插件压缩代码，去使用微信开发者工具内部的压缩代码选项。

## 为什么 space-y-1 这类写法不起作用?

相关 issue：[#108](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/108)

考虑到小程序的组件 `shadow root` 实现方式，默认情况下 `space` 这一类带有子选择器的，只对 `view` 元素生效。

即选择器变成了 `.space-y-1 > view + view`

这时候解决方案有 3 种：

- 组件外层套一层 `<view>` 元素。
- `virtualHost` 解决方案，在自定义组件中添加 `options: { virtualHost: true }` 即可解决此问题。
- [`cssChildCombinatorReplaceValue`](/docs/api/interfaces/UserDefinedOptions#csschildcombinatorreplacevalue) 配置项

## 使用 uni-app vite vue 注册插件时，发行到 h5 环境出现: [plugin:vite-plugin-uni-app-weapp-tailwindcss-adaptor] 'import' and 'export' may appear only with 'sourceType: "module"' (1:0) 错误

解决方案：

```js
// 注意：打包成 h5 和 app 都不需要开启插件配置
const isH5 = process.env.UNI_PLATFORM === "h5";
// vue3 版本构建到 app, UNI_PLATFORM 的值为 app
// vue2 版本为 app-plus
const isApp = process.env.UNI_PLATFORM === "app-plus";
const WeappTailwindcssDisabled = isH5 || isApp;
const vitePlugins = [uni(), uvwt({
  disabled: WeappTailwindcssDisabled
})];
```

即 `h5` 环境和 `app` 环境都不开启我这个插件，因为本来这 2 个环境就是 `tailwindcss` 支持的环境，没必要开启插件转义。

## 使用 pnpm@8 插件注册失败问题

pnpm 8 这个版本改变了一些默认值，其中 `resolution-mode` 默认值变成了 `lowest-direct`。

这会导致所有的依赖，会被安装成你在 `package.json` 里注册的最低版本，这可能会造成一些问题。如何解决？

目录下创建一个 `.npmrc`，设置 `resolution-mode` 为 `highest`，然后重新安装，

或者，使用 `pnpm up -Li` 升级一下你 `package.json` 里的依赖包版本到最新即可。

## uni-app 在从v1升级到v2的过程中，如果使用了云函数相关功能，编译到小程序会出现问题

解决方案参见：<https://ask.dcloud.net.cn/question/170057>

相关 issue：[#74](https://github.com/sonofmagic/weapp-tailwindcss/issues/74#issuecomment-1573033475)

## uni-app vue2 中的 css 使用 @import 引入其他 css，导致在 `rpx` 在H5下不生效

需要添加并配置 `postcss-import`，参见 [issues/75](https://github.com/sonofmagic/weapp-tailwindcss/issues/75#issuecomment-1574592907)。

你可以查看源码中 `demo/uni-app` 相关的示例来进行配置。

## 为什么使用 taro 写 jsx，js 时候，转义不生效？

这是因为 [patch](/docs/quick-start/this-plugin) 方法没有生效，这个指令是用来在运行时暴露 `tailwindcss` 上下文的，只有暴露成功，我们写的 `js` 里的样式，才会变精准转义，否则就会出现在 `jsx` 里写 `className` 不生效的情况。
