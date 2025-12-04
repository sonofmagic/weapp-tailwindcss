# mpx 使用指南

> 本文以 mpxjs 2.8.16 版本为主，这个版本把原先一些裸露在外的 cli 配置文件，给融入到了各个 npm 包中
> 其中 webpack 的主版本为 5, postcss 版本为 8，这意味着你可以使用最新版本的 tailwindcss

**!!!重要**，请把 `@mpxjs/webpack-plugin` 升级到大于等于 [2.8.16](https://github.com/didi/mpx/releases/tag/v2.8.16) 版本。

不然开发时，热更新会有问题，详见:

- [mpx#1146](https://github.com/didi/mpx/issues/1146)
- [weapp-tailwindcss-webpack-plugin#133](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/133)

## 快速开始

### 1. 创建一个 mpx 项目

> 如果你是老的 mpx 项目，要进行迁移，可以查看[官网迁移指南](https://mpxjs.cn/guide/migrate/2.8.html)

```bash
# 全局安装 cli
pnpm add -g @mpxjs/cli
# cli 创建项目
mpx create mpx-project
# 切换到新的 mpx-project 中
cd mpx-project
# 安装包
pnpm install
```

这里的相关初始化文档详见[官网](https://mpxjs.cn/guide/basic/start.html)

### 2. 安装相关依赖

执行:

```bash
pnpm add -D tailwindcss weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel
```

由于 `postcss 8` 和 `autoprefixer` 已经内置，我们无需额外安装，其中:

- `weapp-tailwindcss-webpack-plugin` 是一个给 `tailwindcss` 设计的小程序适配插件

- `postcss-rem-to-responsive-pixel` 则是用来把 `rem` 转化成 `px` 或者 `rpx` 的工具，由于 `tailwindcss` 长度默认都是 `rem` 所以我们需要它把 `rem` 转化成 `rpx`。

### 3. 初始化配置文件

#### tailwind.config.js

在根目录下，创建一个 `tailwind.config.js` 文件，写入内容:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
    // content 是用来指定让 tailwindcss 从哪些文件中提取字符串，来生成对应的工具类
    content: ['./src/**/*.{html,js,ts,mpx}'],
    theme: {
        extend: {}
    },
    plugins: [],
    // 去除 preflight ，因为 preflight.css 主要用来 reset h5 的样式的
    // 如果你有多端需求，可以通过环境变量来控制这个值
    corePlugins: {
        preflight: false
    }
}
```

#### PostCSS 内联配置

通过 `postcssInlineConfig` 把 `tailwindcss` 注册到 mpx 插件链，无需再维护单独的 `postcss.config.js`：

```js
const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')

module.exports = {
  pluginOptions: {
    mpx: {
      plugin: {
        postcssInlineConfig: {
          ignoreConfigFile: true,
          plugins: [
            tailwindcss(),
            autoprefixer({ remove: false })
            // 如果需要 rem 转 rpx，可加上:
            // require('postcss-rem-to-responsive-pixel')({ rootValue: 32, propList: ['*'], transformUnit: 'rpx' })
          ]
        }
      }
    }
  }
}
```

#### vue.config.js

在 `vue.config.js` 注册插件：

```js
const { defineConfig } = require('@vue/cli-service')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
const tailwindcss = require('tailwindcss')
const autoprefixer = require('autoprefixer')
module.exports = defineConfig({
  pluginOptions: {
    mpx: {
      srcMode: 'wx',
      plugin: {
        postcssInlineConfig: {
          ignoreConfigFile: true,
          plugins: [
            tailwindcss(),
            autoprefixer({ remove: false })
          ]
        }
      },
      loader: {}
    }
  },
  configureWebpack(config) {
    config.plugins.push(new UnifiedWebpackPluginV5({
      rem2rpx: true
    }))
  }
})
```

#### src/app.mpx

最后在 `app.mpx` 中引入 `tailwindcss`

```html
<style>
@tailwind base;
@tailwind utilities;
@tailwind components;
    /* 如果你使用 scss，你可以在 style标签上加上 lang="scss" 然后使用@import */
@import 'tailwindcss/base.css';
@import 'tailwindcss/components.css';
@import 'tailwindcss/utilities.css';
</style>
```

就大功告成了

## 注意事项

由于 `tailwindcss` 默认是生成在全局的 `app.wxss` 里的，所以你的组件要想使用样式的话，不要忘记加上

```js
Component({
  options: {
    addGlobalClass: true,
  }
})
```

[微信小程序组件样式隔离相关文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E7%BB%84%E4%BB%B6%E6%A0%B7%E5%BC%8F%E9%9A%94%E7%A6%BB)

<!-- ## 目前存在的问题

目前存在，在开发时，热更新无法生成样式的问题

我给 `mpx` 提了一个 `issue`， 详见 [didi/mpx/issues/1146](https://github.com/didi/mpx/issues/1146)

这时候要保存一下 `app.mpx` / `tailwind.config.js` / `package.json` 进行全量更新

[#133](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/133) 中，这个问题已经修复，请把 `mpx` 升级到大于等于 [2.8.16](https://github.com/didi/mpx/releases/tag/v2.8.16) 版本 -->
<!-- 又出现了保存后，热更新无效的问题

// taro-plugin-compiler-optimization

<https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/123>

<https://github.com/CANntyield/taro-plugin-compiler-optimization/blob/main/index.js>

cache-loader?? -->
