![logo](./assets/logo.jpg)

# weapp-tailwindcss-webpack-plugin

![star](https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss-webpack-plugin)
![dt](https://badgen.net/npm/dt/weapp-tailwindcss-webpack-plugin)
![license](https://badgen.net/npm/license/weapp-tailwindcss-webpack-plugin)
<a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=bOJrjg5Z65fh841eVyf6rOLNWqvluQbk&jump_from=webapi"><img border="0" src="https://img.shields.io/badge/QQ-%E5%8A%A0%E5%85%A5QQ%E7%BE%A4-brightgreen" alt="weapp-tailwindcss-webpack-plug" title="weapp-tailwindcss-webpack-plug"></a>

> 把 `tailwindcss JIT` 思想带入小程序开发吧！

- [weapp-tailwindcss-webpack-plugin](#weapp-tailwindcss-webpack-plugin)
  - [Usage](#usage)
    - [uni-app (vue2/3)](#uni-app-vue23)
    - [uni-app for vite (vue3)](#uni-app-for-vite-vue3)
    - [Taro v3 (React/vue2/3)](#taro-v3-reactvue23)
    - [remax (react)](#remax-react)
    - [rax (react)](#rax-react)
    - [原生小程序(webpack5 mina)](#原生小程序webpack5-mina)
      - [jit 示例](#jit-示例)
  - [编译到 h5 注意事项](#编译到-h5-注意事项)
  - [关于其他小程序](#关于其他小程序)
  - [原理篇](#原理篇)
  - [Options](#options)
  - [Related projects](#related-projects)
    - [模板 template](#模板-template)
    - [预设 tailwindcss preset](#预设-tailwindcss-preset)
  - [Bugs & Issues](#bugs--issues)

笔者之前写了一个 [tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)，可是那个方案不能兼容最广泛的 `Just in time` 引擎，在写法上也有些变体。

于是笔者又写了一个 `weapp-tailwindcss-webpack-plugin`，这是一个 `plugin` 合集，包含 `webpack/vite plugin`，它会同时处理类 `wxml` 和 `wxss` 文件，从而我们开发者，不需要更改任何代码，就能让 `jit` 引擎兼容微信小程序。

此方案可兼容 `tailwindcss v2/v3`，`webpack v4/v5`，`postcss v7/v8`。

> 随着 [`@vue/cli-service`](https://www.npmjs.com/package/@vue/cli-service) v5 版本的发布，uni-app 到时候也会转为 `webpack5` + `postcss8` 的组合，到时候，我会升级一下 `uni-app` 的示例，让它从 `tailwindcss v2 jit` 升级到 `tailwindcss v3 jit`

## Usage

### uni-app (vue2/3)

[使用方式](./docs/uni-app.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/uni-app)

### uni-app for vite (vue3)

[使用方式](./docs/uni-app-vite.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/uni-app-vue3-vite)

### Taro v3 (React/vue2/3)

[使用方式](./docs/taro.md) | [React Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/taro-app) | [vue2 Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/taro-vue2-app) | [vue3 Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/taro-vue3-app)

### remax (react)

[使用方式](./docs/remax.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/remax-app)

### rax (react)

[使用方式](./docs/rax.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/rax-app)

### 原生小程序(webpack5 mina)

[使用方式](./docs/native-mina.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/native-mina)

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

## 编译到 h5 注意事项

有些用户通过 `uni-app` 等跨端框架，不止开发成各种小程序，也开发为 `H5`，然而 `tailwindcss` 本身就兼容 `H5` 了。此时你需要更改配置，我们以 `uni-app` 为例:

```js
// doc link
// https://uniapp.dcloud.io/collocation/auto/api?id=%e6%b5%8b%e8%af%95%e5%b9%b3%e5%8f%b0%e5%88%a4%e6%96%ad
const isH5 = process.env.UNI_PLATFORM === 'h5';
// 然后在 h5 环境下把 webpack plugin 和 postcss for weapp 给禁用掉
// 比如 uni-app-vue3-vite 这个 demo
// vite.config.ts
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { ViteWeappTailwindcssPlugin as vwt } from 'weapp-tailwindcss-webpack-plugin';

export default defineConfig({
  plugins: [uni(), isH5 ? undefined : vwt()]
});

// postcss.config.js
// 假如不起作用，请使用内联postcss
const isH5 = process.env.UNI_PLATFORM === 'h5';

const plugins = [require('autoprefixer')(), require('tailwindcss')()];

if (!isH5) {
  plugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  );

  plugins.push(require('weapp-tailwindcss-webpack-plugin/postcss')());
}

module.exports = {
  plugins
};
```

## 关于其他小程序

处理了其他小程序的:

`/.+\.(?:wx|ac|jx|tt|q|c)ss$/` 样式文件和
`/.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/` 各种 `xxml` 和特殊的 `swan`

## 原理篇

另写一篇文章，大意还是 `css ast`, `[xx]ml ast`, `js ast` 那一套

## Options

| 配置项                    | 类型                                                                           | 描述                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `htmlMatcher`             | `(assetPath:string)=>boolean`                                                  | 匹配 `wxml`等等模板进行处理的方法                                                                    |
| `cssMatcher`              | `(assetPath:string)=>boolean`                                                  | 匹配 `wxss`等等样式文件的方法                                                                        |
| `jsMatcher`               | `(assetPath:string)=>boolean`                                                  | 匹配 `js`文件进行处理的方法，用于 `react`                                                            |
| `mainCssChunkMatcher`     | `(assetPath:string)=>boolean`                                                  | 匹配 `tailwindcss jit` 生成的 `css chunk` 的方法                                                     |
| `framework` (`Taro` 特有) | `react`\|`vue2`\|`vue3`                                                        | 由于 `Taro` 不同框架的编译结果有所不同，需要显式声明框架类型 默认`react`                             |
| `customRuleCallback`      | `(node: Postcss.Rule, options: Readonly<RequiredStyleHandlerOptions>) => void` | 可根据 Postcss walk 自由定制处理方案的 callback 方法                                                 |
| `cssPreflight`            | `Record<string,string>`\| `false`                                              | 在所有 `view`节点添加的 `css` 预设，可根据情况自由的禁用原先的规则，或者添加新的规则。 详细用法如下: |

```js
// default 默认:
cssPreflight: {
  'box-sizing': 'border-box',
  'border-width': '0',
  'border-style': 'solid',
  'border-color': 'currentColor'
}
// result
// box-sizing: border-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 禁用所有
cssPreflight: false
// result
// none

// case 禁用单个属性
cssPreflight: {
  'box-sizing': false
}
// border-width: 0;
// border-style: solid;
// border-color: currentColor

// case 更改和添加单个属性
cssPreflight: {
  'box-sizing': 'content-box',
  'background': 'black'
}
// result
// box-sizing: content-box;
// border-width: 0;
// border-style: solid;
// border-color: currentColor;
// background: black
```

## Related projects

### 模板 template

[uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)

[uni-app-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-vscode-template)

[uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)

[weapp-native-mina-tailwindcss-template](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

### 预设 tailwindcss preset

[tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)

## Bugs & Issues

由于 `uni-app` 和 `taro` 都在快速的开发中，如果遇到 Bugs 或者想提出 Issues

[欢迎提交到此处](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues)
