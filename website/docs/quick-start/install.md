# 1. 安装与配置 tailwindcss

> 请确保你的 `nodejs` 版本 `>=16.6.0`。目前低于 `16` 的长期维护版本(`偶数版本`) 都已经结束了生命周期，建议安装 `nodejs` 的 `LTS` 版本，详见 [nodejs/release](https://github.com/nodejs/release)。
>
> 假如你安装的 `nodejs` 太新，可能会出现安装包不兼容的问题，这时候可以执行安装命令时，使用 `--ignore-engines` 参数进行 `nodejs` 版本的忽略 。

首先安装本插件前，我们需要把 `tailwindcss` 对应的环境和配置安装好。

这里我们参考 `tailwindcss` 官网中 `postcss` 的使用方式进行安装 ([参考链接](https://tailwindcss.com/docs/installation/using-postcss))：

## 1. 使用包管理器安装 `tailwindcss`

```bash
# 使用你喜欢的任意 npm / yarn / pnpm 
npm install -D tailwindcss postcss autoprefixer
# 初始化 tailwind.config.js 文件
npx tailwindcss init
```

:::info
`tailwindcss` 最新版本(`3.x`)对应的 `postcss` 大版本为 `8`，假如你使用像 `uni-app` 或 `taro` 这样的跨端框架，大概率已经内置了 `postcss` 和 `autoprefixer`
:::

## 2. 在项目目录下创建 `postcss.config.js` 并注册 `tailwindcss`

> 注意：这只是比较普遍的注册方式，各个框架很有可能是不同的! 比如 `uni-app vue3 vite` 项目就必须要内联注册 `postcss` 选项! 详见下方的注意事项

```js
// postcss.config.js
// 假如你使用的框架/工具不支持 postcss.config.js 配置文件，则可以使用内联的写法
module.exports = {
  plugins: {
    tailwindcss: {},
    // 假如框架已经内置了 `autoprefixer`，可以去除下一行
    autoprefixer: {},
  }
}
```

:::tip 注意事项
`uni-app vite vue3` 项目，必须在`vite.config.ts` 文件中，使用 `postcss` 内联的写法注册插件。相关写法可以参考我的这个模板项目: [uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)。

而 `uni-app vue webpack5` 项目中的 `postcss.config.js`，在默认情况下，已经预置很多插件在里面，配置比较繁杂，可以参考这个文件 [uni-app-webpack5/postcss.config.js](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-webpack5/postcss.config.js)
:::

## 3. 配置 `tailwind.config.js`

`tailwind.config.js` 是 `tailwindcss` 的配置文件，我们可以在里面配置 `tailwindcss` 的各种行为。

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 uni-app /taro 通用示例，具体要根据你自己项目的目录结构进行配置
  // 不在 content 包括的文件内，你编写的 class，是不会生成对应的css工具类的
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  // 其他配置项
  // ...
  corePlugins: {
    // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false
  }
}
```

## 4. 引入 `tailwindcss`

在你的项目入口引入 `tailwindcss` 使它在小程序全局生效

### uni-app

比如 `uni-app` 的 `App.vue` 文件:

```html
<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
/* 使用 scss */
/* @import 'tailwindcss/base'; */
/* @import 'tailwindcss/utilities'; */
/* @import 'tailwindcss/components'; */
</style>
```

### Taro

又或者 `Taro` 的 `app.scss` 文件:

```scss
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
```

然后在 `app.ts` 里引入这个样式文件即可。

这样 `tailwindcss` 的安装与配置就完成了，接下来让我们进入第二个环节：安装 `weapp-tailwindcss`。

## Refers

[tailwindcss官方配置项link](https://tailwindcss.com/docs/configuration)
