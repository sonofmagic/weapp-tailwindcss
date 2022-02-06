![logo](./assets/logo.jpg)

# weapp-tailwindcss-webpack-plugin

> 把 `tailwindcss JIT` 思想带入小程序开发吧！

- <a href="#uni-app">uni-app 使用方式</a>
- <a href="#taro">taro 使用方式(beta)</a>
- <a href="#native">原生小程序</a>

笔者之前写了一个 [tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)，可是那个方案不能兼容最广泛的 `Just in time` 引擎，在写法上也有些变体。

于是笔者又写了一个 `weapp-tailwindcss-webpack-plugin`，这是一个 `webpack plugin`，它会同时处理类 `wxml` 和 `wxss` 文件，从而我们开发者，不需要更改任何代码，就能让 `jit` 引擎兼容微信小程序。

此方案可兼容 `tailwindcss v2/v3`，`webpack v4/v5`，`postcss v7/v8`。

## Usage

<h3 id="uni-app">uni-app</h3>

由于 `uni-app` 内置的 `webpack` 版本为 `4` , `postcss` 版本为 `7`

#### 1. 于是我们开始安装:

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
```

> [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 是一个由本人撰写的 postcss 插件，支持 `rem` -> `rpx`，同时支持 `postcss7` 和 `postcss8`，[配置见此](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel)

##### Usage

```js
// postcss 8:
require('postcss-rem-to-responsive-pixel')
// postcss 7:
require('postcss-rem-to-responsive-pixel/postcss7')
```

#### 2. 然后添加 `tailwind.config.js`:

```js
// 基础配置，无需任何preset
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app/tailwind.config.js
/** @type {import('@types/tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.{vue,js,ts,jsx,tsx,wxml}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {},
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
```

#### 3. 再添加 `postcss.config.js`

```js
// 参考示例
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app/postcss.config.js
const path = require('path')
module.exports = {
  parser: require('postcss-comment'),
  plugins: [
    require('postcss-import')({
      resolve(id, basedir, importOptions) {
        if (id.startsWith('~@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3))
        } else if (id.startsWith('@/')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2))
        } else if (id.startsWith('/') && !id.startsWith('//')) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1))
        }
        return id
      }
    }),
    require('autoprefixer')({
      remove: process.env.UNI_PLATFORM !== 'h5'
    }),
    // tailwindcss for postcss7
    require('tailwindcss')({ config: './tailwind.config.js' }),
    // rem 转 rpx
    require('postcss-rem-to-responsive-pixel/postcss7')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    }),
    require('@dcloudio/vue-cli-plugin-uni/packages/postcss')
  ]
}
```

#### 4. 添加 `.env` 设置 `TAILWIND_MODE`

```plain
# https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app/.env
# 假如 jit 模式 HMR 失效
TAILWIND_MODE=watch
```

这是为了兼容 postcss7 的 HMR 方案，如果你是用的是 postcss8 就不需要了。

#### 5. 在 `src/App.vue` 中添加:

```vue
<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  //...
})
</script>

<style lang="scss">
/*每个页面公共css */
// scss 需要安装 yarn add -D sass sass-loader@^10
// 小程序需要 'base' 来注入变量，单不需要 html preflight
// @tailwind base;
// @tailwind utilities;
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
</style>
```

#### 6. 在根目录下添加 `vue.config.js`

```js
// vue.config.js
const {
  UniAppWeappTailwindcssWebpackPluginV4
} = require('weapp-tailwindcss-webpack-plugin')

/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  //....
  configureWebpack: {
    plugins: [new UniAppWeappTailwindcssWebpackPluginV4()]
  }
  //....
}

module.exports = config
```

现在，您就可以在 `uni-app` 中使用 `jit` 的大部分特性了！

#### jit example

```html
<view
  :class="[
      flag?'bg-red-900':'bg-[#fafa00]',
      ]"
  >Toggle</view
>
<view
  :class="{
        'bg-[#fafa00]':flag===true,
      }"
  >Toggle</view
>
<view class="p-[20px] -mt-2 mb-[-20px] "
  >p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view
>
<view class="space-y-[1.6rem]">
  <view class="w-[300rpx] text-black text-opacity-[0.19]"
    >w-[300rpx] text-black text-opacity-[0.19]</view
  >
  <view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]"
    >min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view
  >
  <view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]"
    >max-w-[300rpx] min-h-[100px] text-[#dddddd]</view
  >
  <view
    class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]"
    >Hello</view
  >
  <view
    class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]"
    >border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view
  >
  <view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid">
    <div>1</div>
    <div>2</div>
    <div>3</div>
  </view>
  <view
    class="w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300"
  >
    Default
  </view></view
>
```

当然以上只是示例，这样写 class 名称过长，一般我们都会使用 `@apply` 来提取这些样式做成公共类。

<h3 id="taro">Taro v3 (React)</h3>

taro 3 内置 webpack 为 `4` , postcss 为 `8`, 所以可以使用 `tailwindcss` 的 v3 版本

#### 1. 于是我们开始安装:

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss postcss autoprefixer
```

#### 2. 在 taro-app/config 中添加

```js
const {
  TaroWeappTailwindcssWebpackPluginV4
} = require('weapp-tailwindcss-webpack-plugin')

const config = {
  // ...
  mini: {
    webpackChain(chain, webpack) {
      chain.merge({
        plugin: {
          install: {
            plugin: TaroWeappTailwindcssWebpackPluginV4,
            args: [
              {
                // ...
              }
            ]
          }
        }
      })
    }
  }
}
```

#### 3. 执行 `npx tailwindcss init`

创建 `postcss.config.js` 和 `tailwind.config.js`

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [],
  // v3 版本的 tailwindcss 有些不同
  corePlugins: {
    preflight: false
  }
}
```

#### 4. 最后在 `app.scss` 引入后就可以便捷的使用了

[v3 迁移指南](https://tailwindcss.com/docs/upgrade-guide#removed-color-aliases)

```scss
// base 是必要的
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
```

<h3 id="native">原生小程序</h3>
有方案，原理在我脑子里，目前没空实现

TODO

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
