# 常见问题

## 为什么我更改了 class 保存重新打包的时候热更新失效？
>
> 目前微信开发者工具会默认开启 `代码自动热重载 (compileHotReLoad)` 功能，这个功能在原生开发中表现良好，但在 `uni-app` 和 `taro` 等等的框架中，存在一定的问题，详见[issues#37](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/37)，所以如果你遇到了此类问题，建议关闭 `代码自动热重载` 功能。

## `disabled:opacity-50` 这类的 `tailwindcss` 前缀不生效?

微信小程序 `wxss` 选择器的原生限制，无法突破。详见 [issue#33](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/33)。

## 和原生组件一起使用注意事项

假如出现原生组件引入报错的情况，可以参考 [issue#35](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/35) ，忽略指定目录下的文件，跳过插件处理，比如 `uni-app` 中的 `wxcomponents`。

如何更改？在传入的配置项 `cssMatcher`，`htmlMatcher` 这类配置，来过滤指定目录或文件。

## 编译到 h5 / app 注意事项

有些用户通过 `uni-app` 等跨端框架，不止开发成各种小程序，也开发为 `H5`，然而 `tailwindcss` 本身就兼容 `H5` 了。此时你需要更改配置，我们以 `uni-app` 为例:

```js
const isH5 = process.env.UNI_PLATFORM === "h5";
const isApp = process.env.UNI_PLATFORM === "app";
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

遇到这个问题是由于 `babel` 相关的包之间的版本产生了冲突导致的，这种时候可以删除掉 `lock`文件 (`yarn.lock`,`pnpm-lock.yaml`,`package-lock.json`)，然后重新安装即可。

## v1 版本插件的常见问题，使用最新版本插件无须参考

### 我在 `js` 里写了 `tailwindcss` 的任意值，为什么没有生效?

详见 [issue#28](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/28)

A: 因为这个插件，主要是针对, `wxss`,`wxml` 和 `jsx` 进行转义的，`js` 里编写的 `string` 是不转义的。如果你有这样的需求可以这么写:

```js
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
const cardsColor = reactive([
  replaceJs('bg-[#4268EA] shadow-indigo-100'),
  replaceJs('bg-[#123456] shadow-blue-100')
])
```

> 你不用担心把代码都打进来导致体积过大，我在 'weapp-tailwindcss-webpack-plugin/replace' 中，只暴露了2个方法，代码体积 1k左右，esm格式。

### replaceJs 跨端注意点

就是在常见问题中的 `replaceJs` 这个方法原先是为小程序平台设计的，假如你一份代码，需要同时编译到小程序和 `h5` 平台，可以参考如下的封装：

```js
// util.js
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
// uni-app 的条件编译写法
export function replaceClass(str) {
  // #ifdef H5
  return str
  // #endif
  return replaceJs(str)
}
// or 环境变量判断
export function replaceClass(str) {
  // 需要根据自己目标平台自定义，这里仅仅给一些思路
  if(process.env.UNI_PLATFORM === 'h5'){
    return str
  }
  return replaceJs(str)
}

// then other.js
const cardsColor = reactive([
  replaceClass('bg-[#4268EA] shadow-indigo-100'),
  replaceClass('bg-[#123456] shadow-blue-100')
])
```

这样就能在多端都生效了。
