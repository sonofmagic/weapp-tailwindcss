# @weapp-tailwindcss/typography

小程序 `@tailwindcss/typography` 富文本渲染方案

`@weapp-tailwindcss/typography` 是 `@tailwindcss/typography` 的小程序迁移版本，帮助你渲染美丽的富文本。

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

这里以 `uni-app vue3 vite` 项目为例，比如此时我们目标组件为 `typography.vue`:

```html
<template>
  <rich-text :nodes="nodes"></rich-text>
</template>

<script lang="ts" setup>
const nodes = getNodes()
</script>

<style lang="scss">
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

@config "./tailwind.config.js";
</style>
```

在当前组件目录下，单独创建一个 `tailwind.config.js` 来单独处理它，

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    {
      // 由于此时 html 从服务端远程获取，你无法从本地提取到 class，只能服务端那里用到什么 prose 你这就提取什么
      raw: 'prose prose-2xl prose-slate',
    },
  ],
  plugins: [require('@weapp-tailwindcss/typography')],
};

```

此时渲染 `html` 就生效了

## 配置项

配置项与 <https://tailwindcss.com/docs/typography-plugin> 是相同的

## Demo

<https://github.com/sonofmagic/weapp-tailwindcss/blob/main/demo/uni-app-vue3-vite/src/pages/issue/typography.vue>
