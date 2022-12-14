![logo](./assets/logo.jpg)

# weapp-tailwindcss-webpack-plugin

![star](https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss-webpack-plugin)
![dm](https://badgen.net/npm/dm/weapp-tailwindcss-webpack-plugin)
![license](https://badgen.net/npm/license/weapp-tailwindcss-webpack-plugin)
[![test](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin/branch/main/graph/badge.svg?token=zn05qXYznt)](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin)
<a target="_blank" href="https://qm.qq.com/cgi-bin/qm/qr?k=bOJrjg5Z65fh841eVyf6rOLNWqvluQbk&jump_from=webapi"><img border="0" src="https://img.shields.io/badge/QQ-%E5%8A%A0%E5%85%A5QQ%E7%BE%A4-brightgreen" alt="weapp-tailwindcss-webpack-plug" title="weapp-tailwindcss-webpack-plug"></a>

> 把 `tailwindcss JIT` 思想带入小程序开发吧！

- [weapp-tailwindcss-webpack-plugin](#weapp-tailwindcss-webpack-plugin)
  - [Usage](#usage)
    - [uni-app (vue2/3)](#uni-app-vue23)
    - [uni-app for vite (vue3)](#uni-app-for-vite-vue3)
    - [Taro v3 (react | vue2/3)](#taro-v3-react--vue23)
    - [remax (react)](#remax-react)
    - [rax (react)](#rax-react)
    - [原生小程序(webpack5 mina)](#原生小程序webpack5-mina)
    - [HBuilderX 创建的项目](#hbuilderx-创建的项目)
    - [uni-app 构建成 `android/ios` app](#uni-app-构建成-androidios-app)
    - [unocss 集成](#unocss-集成)
  - [Options 配置项](#options-配置项)
    - [htmlMatcher](#htmlmatcher)
    - [cssMatcher](#cssmatcher)
    - [jsMatcher](#jsmatcher)
    - [mainCssChunkMatcher](#maincsschunkmatcher)
    - [framework (`Taro` 特有)](#framework-taro-特有)
    - [customRuleCallback](#customrulecallback)
    - [disabled](#disabled)
    - [cssPreflightRange](#csspreflightrange)
    - [replaceUniversalSelectorWith](#replaceuniversalselectorwith)
    - [customAttributes](#customattributes)
    - [customReplaceDictionary](#customreplacedictionary)
    - [cssPreflight](#csspreflight)
    - [supportCustomLengthUnitsPatch](#supportcustomlengthunitspatch)
  - [使用 arbitrary values](#使用-arbitrary-values)
  - [关于rem转化rpx](#关于rem转化rpx)
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

笔者之前写了一个 [tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)，可是那个方案不能兼容最广泛的 `Just in time` 引擎，在写法上也有些变体。

于是笔者又写了一个 `weapp-tailwindcss-webpack-plugin`，这是一个 `plugin` 合集，包含 `webpack/vite plugin`，它会同时处理类 `wxml` 和 `wxss` 文件，从而我们开发者，不需要更改任何代码，就能让 `jit` 引擎兼容微信小程序。

此方案可兼容 `tailwindcss v2/v3`，`webpack v4/v5`，`postcss v7/v8`。

> 随着 [`@vue/cli-service`](https://www.npmjs.com/package/@vue/cli-service) v5 版本的发布，uni-app 到时候也会转为 `webpack5` + `postcss8` 的组合，到时候，我会升级一下 `uni-app` 的示例，让它从 `tailwindcss v2 jit` 升级到 `tailwindcss v3 jit`，相关进度见 [uni-app/issues/3723](https://github.com/dcloudio/uni-app/issues/3723)

## Usage

### uni-app (vue2/3)

[使用方式](./docs/uni-app.md) | [@vue/cli4 Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/uni-app) | [@vue/cli5 Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/uni-app-webpack5)

### uni-app for vite (vue3)

[使用方式](./docs/uni-app-vite.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/uni-app-vue3-vite)

### Taro v3 (react | vue2/3)

[使用方式(`webpack4/5`)](./docs/taro.md) | [React Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/taro-app) | [vue2 Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/taro-vue2-app) | [vue3 Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/taro-vue3-app)

### remax (react)

[使用方式](./docs/remax.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/remax-app)

### rax (react)

[使用方式](./docs/rax.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/rax-app)

### 原生小程序(webpack5 mina)

[使用方式](./docs/native-mina.md) | [Demo 项目](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/native-mina)

### HBuilderX 创建的项目

[vue2 使用方式](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template#readme) | [vue2 Demo 项目](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template) | [vue3 使用方式](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template#readme) | [vue3 Demo 项目](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

### uni-app 构建成 `android/ios` app

[使用方式](./docs/uni-app-android-and-ios.md)

### unocss 集成

你可以不使用 `tailwindcss`，只需正常安装 `unocss` `@unocss/preset-wind` 和 `@unocss/transformer-directives` 即可

按 `unocss` 文档方式注册后，安装使用此插件，即可正常使用。

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

类型: `Record<string, string>`  
描述: 自定义转化`class`名称字典,你可以使用这个选项来简化生成的`class`

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

## 使用 arbitrary values

详见 [tailwindcss/using-arbitrary-values 章节](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) | [Sample](./docs/arbitrary-values.md)

## 关于rem转化rpx

假如你想要把项目里，所有满足条件的 `rem` 都转化成 `rpx`，那么 `postcss plugin`: [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 适合你。

假如你想缩小一下范围，只把 `tailwindcss` 中默认的工具类的单位(非`jit`生成的`class`)，从 `rem` 转变为 `rpx`，那么 `tailwindcss preset`: [tailwindcss-rem2px-preset](https://www.npmjs.com/package/tailwindcss-rem2px-preset) 适合你。

使用方式见 `Demo` 和对应 `npm` 包的文档。

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
