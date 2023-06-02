# 跨端注意事项

本插件主要作用于小程序环境，让开发者可以在小程序环境下可以使用 `tailwindcss` 的特性

然而在 `h5` 和 `app` 中，它们本来就是 `tailwindcss` 支持的环境，所以是没有必要开启本插件的。

所以你可以这样写:

```js
const isH5 = process.env.UNI_PLATFORM === "h5";
const isApp = process.env.UNI_PLATFORM === "app-plus";
const WeappTailwindcssDisabled = isH5 || isApp;

// 2种选一即可 region start
// 1. 传递 disabled option
const vitePlugins = [uni(), uvwt({
  disabled: WeappTailwindcssDisabled
})];

// 2. 按照条件设置插件
const vitePlugins = [uni()];

if (!WeappTailwindcssDisabled) {
  vitePlugins.push(
    uvwt()
  );
}
// region end
```
