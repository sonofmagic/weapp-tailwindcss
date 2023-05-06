![logo](./assets/logo.jpg)

# weapp-tailwindcss-webpack-plugin

![star](https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss-webpack-plugin)
![dm](https://badgen.net/npm/dm/weapp-tailwindcss-webpack-plugin)
![license](https://badgen.net/npm/license/weapp-tailwindcss-webpack-plugin)
[![test](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin/branch/main/graph/badge.svg?token=zn05qXYznt)](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin)

> 把 `tailwindcss` 带入小程序开发吧！

\[[国内部署的文档地址](https://weapp-tw.icebreaker.top)\] \| \[[1.x文档]('./v1.md')\]

- [weapp-tailwindcss-webpack-plugin](#weapp-tailwindcss-webpack-plugin)
  - [2.x 版本新特性](#2x-版本新特性)
    - [新插件介绍](#新插件介绍)
  - [Usage](#usage)
    - [1. 安装配置 tailwindcss](#1-安装配置-tailwindcss)
    - [2. `rem` 转 `px` 或 `rpx`](#2-rem-转-px-或-rpx)
    - [3. 安装这个插件](#3-安装这个插件)
      - [各个框架注册的方式](#各个框架注册的方式)
  - [从 v1 迁移](#从-v1-迁移)
  - [精确转化与忽略](#精确转化与忽略)
  - [Options 配置项](#options-配置项)
  - [使用任意值(arbitrary values)](#使用任意值arbitrary-values)
  - [变更日志](#变更日志)
  - [常见问题](#常见问题)
  - [Related projects](#related-projects)
    - [CLI 工具](#cli-工具)
    - [模板 template](#模板-template)
      - [如何选择？](#如何选择)
      - [使用`uni-app cli`进行构建 `vscode`开发](#使用uni-app-cli进行构建-vscode开发)
      - [使用`hbuilderx` 进行构建和开发](#使用hbuilderx-进行构建和开发)
      - [原生小程序开发模板](#原生小程序开发模板)
    - [tailwindcss plugin](#tailwindcss-plugin)
    - [tailwindcss preset](#tailwindcss-preset)
  - [Bugs \& Issues](#bugs--issues)

## 2.x 版本新特性

> `2.2.0` 版本后，所以 v1 版本的插件被去除，如果你还是想用 v1 插件，请锁定你的版本在 `2.1.5`

这个版本新增了 `UnifiedWebpackPluginV5`
和 `UnifiedViteWeappTailwindcssPlugin` 这种 `Unified` 开头的插件。

它们能够自动识别并精确处理所有 `tailwindcss` 的工具类。这意味着它可以同时处理所有文件中的静态或动态的 `class`。

相比`v1`版本只有处理`wxss`,`wxml`静态`class`的能力，使用`v2`版本新的插件，你再也不需要在 `js` 里引入并调用标记方法 `replaceJs`了！`2.x` 插件有精准转化 `js`/`jsx` 的能力，大大提升了 `taro` 这种动态模板框架的开发体验。

### 新插件介绍

`UnifiedWebpackPluginV5` 是一个核心插件，所有使用 `webpack` 进行打包的框架都可以使用它，只需要传入 `appType` 配置项: `uni-app`/`taro`/`rax`/`remax`/`mpx` 等等，如果不传的话，插件会去猜测公共的样式文件位置，并进行转化(有可能不准确)。

目前，这个方案只支持 `tailwindcss v3.x.x` 版本和 `webpack5`。同时这个方案依赖 `monkey patch`，所以你应该把

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

加入你的 `package.json`。当然在安装或者更新 `tailwindcss` 后，手动执行  `npx weapp-tw patch` 效果也是一样的，看到 `patch .... successfully` 表示成功。

`UnifiedViteWeappTailwindcssPlugin` 为 `vite` 专用插件，配置项和使用方式也是和上面一致的。

## Usage

### 1. 安装配置 tailwindcss

<details><summary>安装 tailwindcss</summary><br/>

#### 1. 安装 `tailwindcss`

```sh
# npm / yarn / pnpm 
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

#### 2. 把 `tailwindcss` 注册进 `postcss.config.js`

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

#### 3. 配置 `tailwind.config.js`

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

#### 4. 引入 `tailwindcss`

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

又或者 `Taro` 的 `app.scss`

```scss
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
```

然后在 `app.ts` 里引入

> Q&A: 为什么没有引入 `tailwindcss/components`? 是因为里面默认存放的是 pc 端自适应相关的样式，对小程序环境来说没有用处。如果你有 @layer components 相关的工具类需要使用，可以引入。

<br/></details>

### 2. `rem` 转 `px` 或 `rpx`

<details><summary>配置tailwindcss单位转化</summary><br/>

#### 1. 两种转化方式(二者选其一即可)

假如你想要把项目里，所有满足条件的 `rem` 都转化成 `rpx`，那么 `postcss plugin`: [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 适合你。

假如你想缩小一下范围，只把 `tailwindcss` 中默认的工具类的单位(非`jit`生成的`class`)，从 `rem` 转变为 `rpx`，那么 `tailwindcss preset`: [tailwindcss-rem2px-preset](https://www.npmjs.com/package/tailwindcss-rem2px-preset) 适合你。

#### 2. `postcss-rem-to-responsive-pixel`

```sh
npm i -D postcss-rem-to-responsive-pixel
```

安装好之后，把它注册进你的 `postcss.config.js` 即可:

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel': {
      // 32 意味着 1rem = 32rpx
      rootValue: 32,
      // 默认所有属性都转化
      propList: ['*'],
      // 转化的单位,可以变成 px / rpx
      transformUnit: 'rpx',
    },
  },
};
```

#### 3. `tailwindcss-rem2px-preset`

```sh
npm i -D tailwindcss-rem2px-preset
```

然后在 `tailwind.config.js` 中，添加:

```js
// tailwind.config.js

module.exports = {
  presets: [
    require('tailwindcss-rem2px-preset').createPreset({
      // 32 意味着 1rem = 32rpx
      fontSize: 32,
      // 转化的单位,可以变成 px / rpx
      unit: 'rpx'
    })
  ],
  // ...
}
```

这样即可完成 `tailwindcss` 默认 `rem` 单位，转化 `rpx` 的配置了。

<br/></details>

### 3. 安装这个插件

```sh
# npm / yarn /pnpm
npm i -D weapp-tailwindcss-webpack-plugin
# 可以执行一下 patch 方法
npx weapp-tw patch
```

然后把下列脚本，添加进你的 `package.json` 的 `scripts` 字段里:

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

#### 各个框架注册的方式

<details><summary>uni-app (vue2/3)</summary><br/>

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

<br/></details>

<details><summary>uni-app vite(vue3)</summary><br/>

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

<details><summary>Taro v3 (all frameworks)</summary><br/>
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
在 `vue.config.js` 中注册：

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

<details><summary>原生开发 (webpack5/gulp)</summary><br/>

#### webpack5

直接在 `webpack.config.js` 注册即可

```js
// webpack.config.js
  plugins: [
    new UnifiedWebpackPluginV5({
      appType: 'native',
    }),
  ],
```

#### gulp

这个配置稍微繁琐一些

```js
// gulpfile.js

const { createPlugins } = require('weapp-tailwindcss-webpack-plugin/gulp')
// 在 gulp 里使用，先使用 postcss 转化 css，触发 tailwindcss 运行，转化 transformWxss，然后再 transformJs, transformWxml
// createPlugins 参数 options 就是本插件的配置项
const { transformJs, transformWxml, transformWxss } = createPlugins()

// 参考顺序
// transformWxss
function sassCompile() {
  return gulp
    .src(paths.src.scssFiles)
    .pipe(sass({ errLogToConsole: true, outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss())
    .pipe(transformWxss())
    .pipe(
      rename({
        extname: '.wxss'
      })
    )
    .pipe(replace('.scss', '.wxss'))
    .pipe(gulp.dest(paths.dist.baseDir))
}
// transformJs
function compileTsFiles() {
  return gulp.src(paths.src.jsFiles, {}).pipe(plumber()).pipe(tsProject()).pipe(transformJs()).pipe(gulp.dest(paths.dist.baseDir))
}

// transformWxml
function copyWXML() {
  return gulp.src(paths.src.wxmlFiles, {}).pipe(transformWxml()).pipe(gulp.dest(paths.dist.baseDir))
}

// 注意 sassCompile 在 copyWXML 和 compileTsFiles，  这是为了先触发 tailwindcss 处理，从而在运行时获取到上下文
const buildTasks = [cleanTmp, copyBasicFiles, sassCompile, copyWXML, compileTsFiles]
// 注册默认任务 (串行)
gulp.task('default', gulp.series(buildTasks))
```

具体可以参考 [weapp-tailwindcss-gulp-template(gulp打包)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/gulp-app) 模板项目的配置。

<br/></details>

## 从 v1 迁移

在 `2.x` 版本中，可以把之前使用的 `webpack` 插件，全部更换为 `UnifiedWebpackPluginV5` 插件，不过 `vite` 插件的导出有一些小变化:

`1.x`:

```js
import vwt from 'weapp-tailwindcss-webpack-plugin/vite';
```

`2.x`:

```js
// UnifiedViteWeappTailwindcssPlugin 就是新的插件
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss-webpack-plugin/vite';
```

另外新的 `UnifiedWebpackPluginV5` 可以直接从 `weapp-tailwindcss-webpack-plugin` 引入，同时在新的 `UnifiedWebpackPluginV5` 中，之前所有的配置项都被继承了过来，只需要用它直接替换原先插件即可。

另外不要忘记把:

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

添加进你的 `package.json` 里，然后清除原先的打包缓存之后重新打包运行。

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

### htmlMatcher

类型: `((assetPath:string)=>boolean)`\|`string`\|`string[]`  
描述: 匹配 `wxml`等等模板进行处理的方法

### cssMatcher

类型: `((assetPath:string)=>boolean)`\|`string`\|`string[]`  
描述: 匹配 `wxss`等等样式文件的方法

### jsMatcher

类型: `((assetPath:string)=>boolean)`\|`string`\|`string[]`  
描述: 匹配 `js`文件进行处理的方法，用于`jsx`相关模板

### mainCssChunkMatcher

类型: `(assetPath:string)=>boolean`  
描述: 匹配 `tailwindcss jit` 生成的核心 `css chunk` 的方法

### framework (`Taro` 特有)

类型: `react`\|`vue2`\|`vue3`  
描述: 由于 `Taro` 不同框架的编译结果有所不同，需要显式声明框架类型 默认`react`

### customRuleCallback

类型: `(node: Postcss.Rule, options: Readonly<RequiredStyleHandlerOptions>) => void`  
描述: 可根据 Postcss walk 自由定制处理方案的 callback 方法 

### disabled

类型: `boolean`  
描述: 是否禁用该插件，默认为 `false`，一般用于多平台构建，有些平台比如 `h5` 不需要开启此插件，所以可以根据环境变量进行禁用。

### cssPreflightRange

类型: `'view'` \| `'all'`  
描述: 全局`dom`选择器，只有在这个选择器作用范围内的`dom`会被注入 `cssPreflight` 的变量和默认样式。默认为 `'view'` 即只对所有的 `view` 和伪元素生效，想要对所有的元素生效，可切换为 `'all'`,此时需要自行处理和客户端默认样式的冲突

### replaceUniversalSelectorWith

类型: `string` \| `false`  
描述: 把`css`中的全局选择器 **`*`** 替换为指定值，默认替换为 `'view'`，设置为 `false` 时不进行替换，此时小程序会由于不认识`*`选择器而报错

### customAttributes

类型: `Record<string, string | Regexp | (string | Regexp)[]>`  
描述: **这是一个重要的配置!**

它可以自定义`wxml`标签上的`attr`转化属性。默认转化所有的`class`和`hover-class`，这个`Map`的 `key`为匹配标签，`value`为属性字符串或者匹配正则数组。如果你想要增加转化的属性，你可以添加 `*`: `(string | Regexp)[]` 这样的键值对，使其中属性的转化，在所有标签上生效，更复杂的情况，可以传一个Map实例。

假如你要把 `className` 通过组件的prop传递给子组件，又或者想要自定义转化的标签属性时，需要用到此配置，案例详见：[issue#134](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/134) [issue#129](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/129)

### customReplaceDictionary

类型: `'simple' | 'complex' | Record<string, string>`  
描述: 默认为 `'complex'` 模式，这个配置项，用来自定义转化`class`名称字典,你可以使用这个选项来简化生成的`class`

插件中内置了`'simple'`模式和`'complex'`模式:
- `'simple'`模式: 把小程序中不允许的字符串，转义为**相等长度**的代替字符串，这种情况不追求转化目标字符串的一比一绝对等价，即无法从生成结果，反推原先的`class`
- `'complex'`模式: 把小程序中不允许的字符串，转义为**更长**的代替字符串，这种情况转化前后的字符串是等价的，可以从结果进行反推，缺点就是会生成更长的 `class` 导致 `wxml`和`wxss`这类的体积增大

当然，你也可以自定义，传一个 `Record<string, string>` 类型，只需保证转化后 css 中的 `class` 选择器，不会和自己定义的 `class` 产生冲突即可，示例见[dic.ts](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/src/dic.ts)

### minifiedJs

类型: `boolean`  
描述: 是否压缩生成的js文件内容，默认使用环境变量判断: `process.env.NODE_ENV === 'production'`

### cssPreflight

类型: `Record<string,string>`\| `false`  
描述: 在所有 `view`节点添加的 `css` 预设，可根据情况自由的禁用原先的规则，或者添加新的规则。 详细用法如下:
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


### supportCustomLengthUnitsPatch

类型: `ILengthUnitsPatchOptions` \| `boolean`  
描述: 自从`tailwindcss 3.2.0`对任意值添加了长度单位的校验后，小程序中的`rpx`这个`wxss`单位，由于不在长度合法名单中，于是被识别成了颜色，导致与预期不符，详见：[issues/110](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110)。所以这个选项是用来给`tailwindcss`运行时，自动打上一个支持`rpx`单位的补丁。默认开启，在绝大部分情况下，你都可以忽略这个配置项，除非你需要更高级的自定义。
> 目前自动检索存在一定的缺陷，它会在第一次运行的时候不生效，关闭后第二次运行才生效。这是因为 nodejs 运行时先加载好了 `tailwindcss` 模块 ，然后再来运行这个插件，自动给 `tailwindcss` 运行时打上 `patch`。此时由于 `tailwindcss` 模块已经加载，所以 `patch` 在第一次运行时不生效，`ctrl+c` 关闭之后，再次运行才生效。这种情况可以使用:
```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

使用 `npm hooks` 的方式来给 `tailwindcss` 自动打 `patch`

## 使用任意值(arbitrary values)

详见 [tailwindcss/using-arbitrary-values 章节](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)

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

~~[uni-app-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-vscode-template)(不推荐,此版本为webpack5打包vue3,建议使用上面的vite打包vue3的模板)~~

[uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)

#### 使用`hbuilderx` 进行构建和开发

~~[uni-app-vue2-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template)(不推荐,此版本收到hbuilderx的限制，无法升级到最新的tailwindcss)~~

[uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

#### 原生小程序开发模板

[weapp-tailwindcss-gulp-template(gulp打包)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/gulp-app)

[weapp-native-mina-tailwindcss-template(webpack打包)](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

### tailwindcss plugin

[weapp-tailwindcss-children](https://github.com/sonofmagic/weapp-tailwindcss-children)

### tailwindcss preset

[tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)

## Bugs & Issues

目前这个插件正在快速的开发中，如果遇到 `Bug` 或者想提出 `Issue`

[欢迎提交到此处](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues)
