# 安装与配置 tailwindcss

首先安装插件之前，自然是需要把 `tailwindcss` 对应的环境安装好咯。

这里我们参考 `tailwindcss` 官网中，`postcss` 的使用方式进行安装 ([参考链接](https://tailwindcss.com/docs/installation/using-postcss))：

## 1. 使用包管理器安装 `tailwindcss`

```bash
# 使用你喜欢的任意 npm / yarn / pnpm 
npm install -D tailwindcss postcss autoprefixer
# 初始化 tailwind.config.js 文件
npx tailwindcss init
```

:::info
`tailwindcss` 最新版本(`3.x`)对应的 `postcss` 大版本为 `8`，假如你使用跨端框架，大概率已经内置了 `postcss` 和 `autoprefixer`
:::

## 2. 创建 `postcss.config.js` 并注册 `tailwindcss`

```js
// postcss.config.js
// 假如你使用的框架/工具不支持 postcss.config.js，则可以使用内联的写法
// 其中 `autoprefixer` 有可能已经内置了，假如框架内置了可以去除
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

:::tip
注意：这只是比较普遍的注册方式，各个框架很有可能是不同的。  
像 `uni-app vite vue3` 可能要使用内联的写法，这点可以参考我的这个模板项目: [uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)。  
而 `uni-app vue webpack5 alpha` 版本中的 `postcss.config.js` 已经预置很多插件在里面了，这个配置可以参考 [uni-app-webpack5/postcss.config.js](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app-webpack5/postcss.config.js)
:::

## 3. 配置 `tailwind.config.js`

`tailwind.config.js` 是 `tailwindcss` 的配置文件，我们可以在里面配置 `tailwindcss jit(Just in time)`引擎的各种行为。

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 uni-app /taro 通用示例，具体要根据你自己项目的目录结构进行配置
  // 不在 content 包括的文件内编写的 class，不会生成对应的工具类
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  // 其他配置项
  // ...
  corePlugins: {
    // 不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false
  }
}
```

:::tip
这块可以参考[tailwindcss官方具体的配置项link](https://tailwindcss.com/docs/configuration)
:::

## 4. 引入 `tailwindcss`

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

然后在 `app.ts` 里引入这个样式文件即可

:::tip Q&A
为什么没有引入 `tailwindcss/components`? 是因为里面默认存放的是 pc 端自适应相关的样式，对小程序环境来说没有用处。如果你有 `@layer components` 相关的工具类需要使用，则可以引入。
:::

这样 `tailwindcss` 的安装与配置就完成了，接下来让我们进入第二个环节：配置 `rem` 单位转化。
