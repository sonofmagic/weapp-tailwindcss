# 常见问题

## 为什么我更改了 class 保存重新打包的时候热更新失效？

[[#93](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/93)]

> 目前微信开发者工具会默认开启 `代码自动热重载 (compileHotReLoad)` 功能，这个功能在原生开发中表现良好，但在 `uni-app` 和 `taro` 等等的框架中，存在一定的问题，详见[issues#37](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/37)，所以如果你遇到了此类问题，建议关闭 `代码自动热重载` 功能。

## `disabled:opacity-50` 这类的 `tailwindcss` 工具类不生效?

这是由于微信小程序 `wxss` 选择器的原生限制，无法突破。详见 [issue#33](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/33)。

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

## taro3.6.2 webpack5 环境下，这个插件和 terser-webpack-plugin一起使用，会导致插件转义功能失效

[[#142](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/142)]

压缩代码，不要使用 <https://docs.taro.zone/docs/config-detail/#terserenable> 链接中的方法，太老旧了

`taro` 配置项里，已经有对应的 `terser` 配置项了，详见 <https://taro-docs.jd.com/docs/compile-optimized>

另外也可以不利用 `webpack` 插件压缩代码，去使用微信开发者工具内部的压缩代码选项。

## 为什么 space-y-1 这类写法不起作用?

[[#108](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/108)]

考虑到小程序的组件(shadow root)实现方式，默认情况下 `space` 这一类带有子选择器的，只对 `view` 元素生效。

即选择器变成了 `.space-y-1 > view + view`

这时候解决方案有 `2` 种：

- 组件外层套view标签
- `virtualHost` 解决方案，在自定义组件中添加
 options: { virtualHost: true, } 即可解决此问题.
