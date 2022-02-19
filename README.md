![logo](./assets/logo.jpg)

# weapp-tailwindcss-webpack-plugin

> 把 `tailwindcss JIT` 思想带入小程序开发吧！

- <a href="#uni-app">uni-app 使用方式(vue2/3)</a>
- <a href="#uni-app-vite">uni-app for vite 使用方式(vue3)</a>
- <a href="#taro">taro 使用方式(react)</a>
- <a href="#remax">remax 使用方式(react)</a>
- <a href="#rax">rax 使用方式(react)</a>

笔者之前写了一个 [tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)，可是那个方案不能兼容最广泛的 `Just in time` 引擎，在写法上也有些变体。

于是笔者又写了一个 `weapp-tailwindcss-webpack-plugin`，这是一个 `plugin` 合集，包含 `webpack/vite plugin`，它会同时处理类 `wxml` 和 `wxss` 文件，从而我们开发者，不需要更改任何代码，就能让 `jit` 引擎兼容微信小程序。

此方案可兼容 `tailwindcss v2/v3`，`webpack v4/v5`，`postcss v7/v8`。

> 随着 [`@vue/cli-service`](https://www.npmjs.com/package/@vue/cli-service) v5 版本的发布，uni-app 到时候也会转为 `webpack5` + `postcss8` 的组合，到时候，我会升级一下 `uni-app` 的示例，让它从 `tailwindcss v2 jit` 升级到 `tailwindcss v3 jit`

## Usage

<h3 id="uni-app">uni-app (vue 2/3)</h3>

[使用方式](./docs/uni-app.md)

[Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/uni-app)

<h3 id="uni-app-vite">uni-app for vite (vue3)</h3>

[使用方式](./docs/uni-app-vite.md)

[Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/uni-app-vue3-vite)

<h3 id="taro">Taro v3 (React)</h3>

[使用方式](./docs/taro.md)

[Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/taro-app)

<h3 id="remax">remax (react)</h3>

[使用方式](./docs/remax.md)

[Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/remax-app)

<h3 id="rax">rax (react)</h3>

[使用方式](./docs/rax.md)

[Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/rax-app)

#### jit 示例

```html
<view :class="[flag?'bg-red-900':'bg-[#fafa00]']">bg-[#fafa00]</view>
<view :class="{'bg-[#098765]':flag===true}">bg-[#098765]</view>
<view class="p-[20px] -mt-2 mb-[-20px] ">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view>
<view class="space-y-[1.6rem]">
  <view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view>
  <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view>
  <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view>
  <view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view>
  <view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view>
  <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
    <view>1</view>
    <view>2</view>
    <view>3</view>
  </view>
</view>
```

or `@apply`

```vue
<template><view class="hello">world</view></template>
<style lang="scss">
.hello {
  @apply flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff] #{!important};
}
</style>
```

当然以上只是示例，这样写 class 名称过长，一般我们都会使用 `@apply` 来提取这些样式做成公共类。

## 关于其他小程序

处理了其他小程序的:

`/.+\.(?:wx|ac|jx|tt|q|c)ss$/` 样式文件和
`/.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/` 各种 `xxml` 和特殊的 `swan`

## 原理篇

另写一篇文章，大意还是 `css ast`, `[xx]ml ast`, `js ast` 那一套

TODO

## Options

| 配置项                | 类型              | 描述                                             |
| --------------------- | ----------------- | ------------------------------------------------ |
| `htmlMatcher`         | (string)=>boolean | 匹配 `wxml`等等模板进行处理的方法                |
| `cssMatcher`          | (string)=>boolean | 匹配 `wxss`等等样式文件的方法                    |
| `jsMatcher`           | (string)=>boolean | 匹配 `js`文件进行处理的方法，用于 `react`        |
| `mainCssChunkMatcher` | (string)=>boolean | 匹配 `tailwindcss jit` 生成的 `css chunk` 的方法 |

## Bugs & Issues

由于 `uni-app` 和 `taro` 都在快速的开发中，如果遇到 Bugs 或者想提出 Issues

[欢迎提交到此处，笔者会尽快复现并修改](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues)
