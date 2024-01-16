# @weapp-tailwindcss/typography

小程序 `@tailwindcss/typography` 富文本渲染方案

`@weapp-tailwindcss/typography` 是 `@tailwindcss/typography` 的小程序迁移版本，帮助你渲染美丽的富文本。

<iframe src="//player.bilibili.com/player.html?aid=751356751&bvid=BV16k4y1S7nY&cid=1408037969&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 介绍

在小程序中，我们往往使用 [rich-text](https://developers.weixin.qq.com/miniprogram/dev/component/rich-text.html) 组件，然后从后端请求到 `html` 字符串片段，然后放到小程序中去渲染，所示:

```html
<rich-text nodes="{{nodes}}"></rich-text>
```

但是，使用它有很多的限制，比如自定义组件中使用 `rich-text` 组件，那么仅自定义组件的 `wxss` 样式对 `rich-text` 中的 `class` 生效。

所以针对这种 `case` 设计了 `@weapp-tailwindcss/typography` 来解决小程序渲染富文本的问题。

## 如何使用?

### 安装

```sh
npm i -D @weapp-tailwindcss/typography
```

### 注册

这里比较特殊，由于`rich-text` 组件的样式限制: 自定义组件中使用 `rich-text` 组件，那么仅自定义组件的 `wxss` 样式对 `rich-text` 中的 `class` 生效

#### 创建组件

这里以 `uni-app vue3 vite` 项目为例，比如此时我们目标组件为 `typography.vue`:

```html
<template>
  <rich-text class="prose" :nodes="nodes"></rich-text>
</template>

<script lang="ts" setup>
// getHtml 为你获取 html 的方法
import transform from '@weapp-tailwindcss/typography/transform'
const nodes = transform(getHtml()) 
</script>

<style>
@config "./tailwind.typography.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>
```

#### 创建独立 tailwindcss 上下文

在当前 `typography.vue` 组件目录下，单独创建一个 `tailwind.typography.config.js` 来创建独立的 `tailwindcss` 上下文，单独处理它，

```js
const path = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, './typography.vue')],
  plugins: [require('@weapp-tailwindcss/typography')],
  corePlugins: {
    preflight: false,
  },
};
```

此时渲染 `html` 就生效了。

#### 指定全局样式配置文件

但是这还没有结束，为了防止这个上下文，影响到你全局的 `tailwindcss` 上下文，你必须做一个显式指定。

此时要在你的引入 `tailwindcss` 的入口文件处(`App.vue`)，声明它用的是根目录的 `tailwind.config.js`

```css
@config "../tailwind.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

这样配置才最终完成。

> 使用 @import 要注意加载顺序是不同的，详见 <https://tailwindcss.com/docs/functions-and-directives#config>

## 配置项

大体的配置项与 <https://tailwindcss.com/docs/typography-plugin> 是相同的

额外添加了 `mode` 和 `classPrefix`

## 原理解释

`@weapp-tailwindcss/typography/transform` 这个方法是为你的 `html` 所有的元素给大上 `class` 属性，这样才能使用那些 `prose-headings:bg-red-100`,`prose-h5:text-green-400` 的写法，来覆盖原先富文本的样式。

而 `@weapp-tailwindcss/typography` 通过 `mode` 的配置，`mode` 为 `tag` 表示为原先默认的行为，`mode` 为 `class`，此时插件更改为对所有的 `class` 选择器生效，而不是对所有的标签生效。默认值为 `class`

假如你觉得 `@weapp-tailwindcss/typography/transform` 放在小程序端处理，体积太大了，你可以把它放在 `nodejs` 服务中，预先处理。

## Demo

<https://github.com/sonofmagic/weapp-tailwindcss/blob/main/demo/uni-app-vue3-vite/src/pages/issue/typography.vue>
