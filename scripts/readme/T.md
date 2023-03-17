![logo](./assets/logo.jpg)

# weapp-tailwindcss-webpack-plugin

![star](https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss-webpack-plugin)
![dm](https://badgen.net/npm/dm/weapp-tailwindcss-webpack-plugin)
![license](https://badgen.net/npm/license/weapp-tailwindcss-webpack-plugin)
[![test](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin/branch/main/graph/badge.svg?token=zn05qXYznt)](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin)

> 把 `tailwindcss` 带入小程序开发吧！

[[1.x文档]('./v1.md')]

- [weapp-tailwindcss-webpack-plugin](#weapp-tailwindcss-webpack-plugin)
  - [2.x 版本完善了什么？](#2x-版本完善了什么)
  - [Usage](#usage)
    - [Install tailwindcss](#install-tailwindcss)
    - [关于rem转化rpx](#关于rem转化rpx)
    - [Install this Plugin](#install-this-plugin)
  - [从 v1 迁移](#从-v1-迁移)
  - [精确转化与忽略](#精确转化与忽略)
  - [Options 配置项](#options-配置项)
  - [使用 arbitrary values](#使用-arbitrary-values)
  - [变更日志](#变更日志)
  - [常见问题](#常见问题)
  - [Related projects](#related-projects)
    - [CLI 工具](#cli-工具)
    - [模板 template](#模板-template)
      - [如何选择？](#如何选择)
      - [使用`uni-app cli`进行构建 `vscode`开发](#使用uni-app-cli进行构建-vscode开发)
      - [使用`hbuilderx` 进行构建和开发](#使用hbuilderx-进行构建和开发)
    - [tailwindcss plugin](#tailwindcss-plugin)
    - [tailwindcss preset](#tailwindcss-preset)
  - [Bugs \& Issues](#bugs--issues)

## 2.x 版本完善了什么？

`2.x` 版本发布了，在内部新增了 `UnifiedWebpackPluginV5`
和 `vite` 插件 `UnifiedViteWeappTailwindcssPlugin` 这种 `Unified` 开头的插件，能够自动识别并精确处理所有 `tailwindcss` 的工具类，这意味着它可以同时处理 `wxss`,`wxml` 和 `js` 里动态的 `class`。所以你再也不需要手动 `replaceJs(xxx)`了！使用新版插件，`weapp-tailwindcss-webpack-plugin/replace` 就进入了历史的垃圾堆。

`UnifiedWebpackPluginV5` 是一个核心插件，所有使用 `webpack` 进行打包的框架都可以使用它，只需要传入 `appType` 配置项: `uni-app`/`taro`/`rax`/`remax`/`mpx` 等等，如果不传的话，插件会去猜测公用样式文件的位置进行转化(有可能不准确)。

目前，这个方案只支持 `tailwindcss v3.2.0` 以上版本和 `webpack5`。同时这个方案依赖 `monkey patch`，所以你应该把

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

加入你的 `package.json`，当然在安装或者更新 `tailwindcss` 后，手动执行  `npx weapp-tw patch` 也是可以的，看到 `patch .... successfully` 表示成功。

## Usage

### Install tailwindcss

<details><summary>安装 tailwindcss</summary><br/>

1. 安装 `tailwindcss`

```sh
# npm / yarn / pnpm 
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

2. 把 `tailwindcss` 注册进 `postcss.config.js`

```js
// postcss.config.js
// 假如你使用的框架/工具不支持 postcss.config.js，则可以使用内联的写法
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

3. 配置 `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 uni-app /taro 通用示例，具体要根据你自己项目的目录进行配置
  // 不在 content 包括的文件内，不会生成工具类
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],

  corePlugins: {
    // 不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false
  }
}
```

4. 引入 `tailwindcss`

在你的项目入口引入 `tailwindcss`

比如 `uni-app` 的 `App.vue`

```html
<style>
@tailwind base;
@tailwind utilities;
/* 使用 scss */
/* @import 'tailwindcss/base'; */
/* @import 'tailwindcss/utilities'; */
</style>
```

Taro 的 `app.scss`

```scss
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
```

然后在 `app.ts` 里引入
> 没有使用 `tailwindcss/components` 是因为里面默认存放的是 pc 端自适应相关的样式，对小程序没有用处。如果你有 @layer components 相关的工具类需要使用，可以再引入。

<br/></details>

### 关于rem转化rpx

假如你想要把项目里，所有满足条件的 `rem` 都转化成 `rpx`，那么 `postcss plugin`: [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 适合你。

假如你想缩小一下范围，只把 `tailwindcss` 中默认的工具类的单位(非`jit`生成的`class`)，从 `rem` 转变为 `rpx`，那么 `tailwindcss preset`: [tailwindcss-rem2px-preset](https://www.npmjs.com/package/tailwindcss-rem2px-preset) 适合你。

### Install this Plugin

```sh
# npm / yarn /pnpm
npm i -D weapp-tailwindcss-webpack-plugin
# 可以执行一下 patch 方法
npx weapp-tw patch
```

<details>

<summary>uni-app (vue2/3)</summary><br/>

**在创建uni-app项目时，请选择uni-app alpha版本**

```sh
vue create -p dcloudio/uni-preset-vue#alpha my-alpha-project
```

这是因为默认创建的版本还是 `@vue/cli 4.x` 的版本，使用 `webpack4` 和 `postcss7`，而 `alpha` 版本使用 `@vue/cli 5.x` 即 `webpack5` 和 `postcss8`，这可以使用最新版本的 `tailwindcss` 和本插件。

```js
// 在 vue.config.js 里注册
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  // some option...
  configureWebpack: (config) => {
    config.plugins.push(
      new UnifiedWebpackPluginV5({
        appType: 'uni-app'
      })
    )
  }
  // other option...
}

module.exports = config
```

<br/>
</details>

<details><summary>uni-app vue3/vite</summary><br/>

```js
// vite.config.[jt]s
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss-webpack-plugin/vite'

const vitePlugins = [uni(),uvwt()]

export default defineConfig({
  plugins: vitePlugins,
  // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
  // css: {
  //   postcss: {
  //     plugins: postcssPlugins,
  //   },
  // },
});

```

<br/></details>

<details><summary>Taro v3 (react | vue2/3)</summary><br/>

**在使用Taro时，检查一下把 config/index 的配置项 compiler 设置为 'webpack5'**

```js
// config/index
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')

{
  mini: {
    webpackChain(chain, webpack) {
      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [{
              appType: 'taro'
            }]
          }
        }
      })
    }
  }
}
```

<br/></details>

<details><summary>mpx (原生增强)</summary><br/>

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')

module.exports = defineConfig({
  // other options
  configureWebpack(config) {
    config.plugins.push(new UnifiedWebpackPluginV5({
      appType: 'mpx'
    }))
  }
})

```

<br/></details>

<details><summary>rax (react)</summary><br/>

在根目录下创建一个 `build.plugin.js` 文件，然后在 `build.json` 中注册：

```json
{
  "plugins": [
    "./build.plugin.js"
  ],
}
```

回到 `build.plugin.js`

```js
// build.plugin.js
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    config.plugin('UnifiedWebpackPluginV5').use(UnifiedWebpackPluginV5, [
      {
        appType: 'rax',
      },
    ]);
  });
};

```

<br/></details>

<details><summary>原生小程序(webpack5)</summary><br/>

直接在 `webpack.config.js` 注册即可

```js
// webpack.config.js
  plugins: [
    new UnifiedWebpackPluginV5({
      appType: 'native',
    }),
  ],
```

<br/></details>

<details><summary>remax (react)</summary><br/>
由于使用的还是`webpack4` 和 `postcss7`，建议使用此插件的 `1.x` 版本
<br/></details>

## 从 v1 迁移

在 `2.x` 版本中，所有原先的 `v1` 的插件还是想之前一样导出，`vite` 插件有一些小变化:

另外 `UnifiedWebpackPluginV5` 可以直接从 `weapp-tailwindcss-webpack-plugin` 引入，但 `vite` 会有一些区别:

`1.x`:

```js
import vwt from 'weapp-tailwindcss-webpack-plugin/vite';
```

`2.x`:

```js
// ViteWeappTailwindcssPlugin 就是原先上面 1.x 的 vwt 
// UnifiedViteWeappTailwindcssPlugin 就是新的插件
// 使用方式和 ViteWeappTailwindcssPlugin 一致
import { UnifiedViteWeappTailwindcssPlugin, ViteWeappTailwindcssPlugin } from 'weapp-tailwindcss-webpack-plugin/vite';
```

同时在新的 `UnifiedWebpackPluginV5` 中，之前所有的配置项都被继承了过来，只需要替换插件即可。

<!-- 所以用 `uni-app` 的，建议你使用 `@vue/cli5`版本，`taro` 则切换到 `webpack5`。 -->

## 精确转化与忽略

默认对所有 `jsx`,`js`,`wxml`,`wxss`中出现的`tailwindcss`运行时工具类进行转化，如果不需要转化可以使用 `/*weapp-tw ignore*/` 前置注释。

例如:

```js
<view :class="classArray">classArray</view>
const classArray = [
  'text-[30rpx]',
  /*weapp-tw ignore*/ 'bg-[#00ff00]'
]
```

此时只有 `'text-[30rpx]'` 会被转化，`'bg-[#00ff00]'`被忽视

另外有可能出现的问题，我也写进了 [常见问题](#常见问题) 中，可以进行参考。
<!-- ### HBuilderX 创建的项目

需要创建 `vite` 版本或者 `HBuilderX`最新`alpha`版，方式同上

### uni-app 构建成 `android/ios` app

[建议配置方式](./docs/uni-app-android-and-ios.md) -->

## Options 配置项

{{options-table}}

## 使用 arbitrary values

详见 [tailwindcss/using-arbitrary-values 章节](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) | [Sample](./docs/arbitrary-values.md)

## [变更日志](./CHANGELOG.md)

## 常见问题

> 目前微信开发者工具会默认开启 `代码自动热重载 (compileHotReLoad)` 功能，这个功能在原生开发中表现良好，但在 `uni-app` 和 `taro` 等等的框架中，存在一定的问题，详见[issues#37](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/37)，所以如果你遇到了此类问题，建议关闭 `代码自动热重载` 功能。

[常见问题见 FAQ.md](./docs/faq.md)

## Related projects

### CLI 工具

[weapp-ide-cli](https://github.com/sonofmagic/utils/tree/main/packages/weapp-ide-cli): 一个微信开发者工具命令行，快速方便的直接启动 ide 进行登录，开发，预览，上传代码等等功能。

### 模板 template

#### 如何选择？

假如你仅仅是开发一个`小程序` + `h5` 的组合，那么使用 `vscode` 模板就足够了

假如你的项目构建的重点平台是 `app` 那么还是推荐使用 `hbuilderx` 模板，因为 `hbuilderx` 自带了一套 `app` 构建和调试的工具链，可以更好的支持你的开发。

#### 使用`uni-app cli`进行构建 `vscode`开发

[uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)

[uni-app-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-vscode-template)

[uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)

[weapp-native-mina-tailwindcss-template](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

#### 使用`hbuilderx` 进行构建和开发

[uni-app-vue2-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template)

[uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

### tailwindcss plugin

[weapp-tailwindcss-children](https://github.com/sonofmagic/weapp-tailwindcss-children)

### tailwindcss preset

[tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)

## Bugs & Issues

目前这个插件正在快速的开发中，如果遇到 `Bug` 或者想提出 `Issue`

[欢迎提交到此处](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues)
