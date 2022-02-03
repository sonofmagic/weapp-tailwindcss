# weapp-tailwindcss-webpack-plugin

> 把 `tailwindcss JIT` 带入小程序吧！

笔者之前写了一个 [tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)，可是那个方案不能兼容最广泛的 `Just in time` 引擎，在写法上也有些变体。

于是笔者又写了一个 `weapp-tailwindcss-webpack-plugin`，这是一个 `webpack plugin`，它会同时处理类 `wxml` 和 `wxss` 文件，从而我们开发者，不需要更改任何代码，就能让 `jit` 引擎兼容微信小程序。

此方案可兼容 `tailwindcss v2/v3`，`webpack v4/v5`，`postcss v7/v8`。

## Usage

### uni-app

由于 `uni-app` 内置的 `webpack` 版本为 `4` , `postcss` 版本为 `7`

#### 1. 于是我们开始安装:

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
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
  plugins: []
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
  mpType: 'app',
  onLaunch() {
    console.log('App Launch')
  },
  onShow() {
    console.log('App Show')
  },
  onHide() {
    console.log('App Hide')
  }
})
</script>

<style lang="scss">
// 小程序不需要 'base' 'components'，里面标签是给 html 准备的
// @import 'tailwindcss/base';
// @import 'tailwindcss/components';
@import 'tailwindcss/utilities';
/*每个页面公共css */
</style>
```

把工具类添加进来。

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

## taro

TODO

## 原生微信小程序

TODO

## 其他小程序

暂时只处理了`wxml`和`wxss`, 还未进行处理 TODO
