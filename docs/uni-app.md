由于 `uni-app` 内置的 `webpack` 版本为 `4` , `postcss` 版本为 `7`, 所以还是只能使用 `@tailwindcss/postcss7-compat` 版本。

> `vue/cli 5`目前已在 `2.x alpha` 版本支持，具体见 [uni-app/issues/3723](https://github.com/dcloudio/uni-app/issues/3723)，如果你使用 `vue/cli 5` 这个版本的 `uni-app`，你就能享受到 `webpack5` 和 `postcss8` 这2个带来的好处，这意味着你可以直接使用最新版本的 `tailwindcss` ，无需使用 `postcss7-compat` 兼容版本。

## 1. 于是我们开始安装

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
```

> [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 是一个由本人撰写的 postcss 插件，支持 `rem` -> `rpx`，同时支持 `postcss7` 和 `postcss8`，[配置见此](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel)

### Usage

```js
// postcss 8:
require('postcss-rem-to-responsive-pixel')
// postcss 7:
require('postcss-rem-to-responsive-pixel/postcss7')
```

## 2. 然后添加 `tailwind.config.js`

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

## 3. 再添加 `postcss.config.js`

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

## 4. 添加 `.env` 设置 `TAILWIND_MODE`

```plain
# https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app/.env.development
# 假如 jit 模式 HMR 失效
TAILWIND_MODE=watch
```

这是为了兼容 postcss7 的 HMR 方案，如果你是用的是 postcss8 就不需要了。

## 5. 在 `src/App.vue` 中添加

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
// 小程序需要 'base' 来注入变量，但不需要 html preflight
// @tailwind base;
// @tailwind utilities;
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
</style>
```

## 6. 在根目录下添加 `vue.config.js`

```js
// vue.config.js
const { UniAppWeappTailwindcssWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin')

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
