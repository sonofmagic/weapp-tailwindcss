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
  - [Options 配置项](#options-配置项)
  - [使用 arbitrary values](#使用-arbitrary-values)
  - [变更日志](#变更日志)
  - [常见问题](#常见问题)
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

## Options 配置项

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
## 使用 arbitrary values

详见 [tailwindcss/using-arbitrary-values 章节](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values) | [Sample](./docs/arbitrary-values.md)

## [变更日志](./CHANGELOG.md)

## 常见问题

> 目前微信开发者工具会默认开启 `代码自动热重载 (compileHotReLoad)` 功能，这个功能在原生开发中表现良好，但在 `uni-app` 和 `taro` 等等的框架中，存在一定的问题，详见[issues#37](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/37)，所以如果你遇到了此类问题，建议关闭 `代码自动热重载` 功能。

[常见问题见 FAQ.md](./docs/faq.md)


## Related projects

### 模板 template

[uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)

[uni-app-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-vscode-template)

[uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)

[weapp-native-mina-tailwindcss-template](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

### 预设 tailwindcss preset

[tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)

## Bugs & Issues

目前这个插件正在快速的开发中，如果遇到 `Bug` 或者想提出 `Issue`

[欢迎提交到此处](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues)



<!-- ## 关于其他小程序

处理了其他小程序的:

`/.+\.(?:wx|ac|jx|tt|q|c)ss$/` 样式文件和
`/.+\.(?:(?:(?:wx|ax|jx|ks|tt|q)ml)|swan)$/` 各种 `xxml` 和特殊的 `swan` -->
