# 构建以及引入外部组件

## 前言

我们在日常的开发中，经常会去使用和封装各种各样的组件库。有些是开源的，第三方开发的UI库，有些是我们开发人员给自己的特定的业务封装的UI库。其中很多情况其实是以流行的 `开源UI库(或者fork的改版)` + `自己封装的业务组件为主的`

`开源UI库` 它们的样式相对来说是独立于整套系统的，比如它们的样式都是 `ant-`，`el-` 开头的，一般引入之后不会和原先系统里的样式产生冲突。而 `自己封装的业务组件`，由于往往和系统高度绑定也没有这样的问题。

那么如何用 `tailwindcss` 来构建/发布和引入自己封装的业务组件呢？

## 构建组件

### 核心思想

首先我必须重点把本篇文章的核心思想预先抛出：

`tailwindcss` 只是一个`css`生成器，它只是帮你按照一定的规则，从你的源代码中匹配字符串去生成`css`。所以在用它去构建组件的时候，一定要去思考你用 `tailwindcss` 生成的 `css` 的影响范围，因为大部分用 `tailwindcss` 都是默认全局应用的。但是你在组件里面的自定义样式很多情况下，是没有必要的。

根据这个核心思想，我们就可以知道在封装组件时可行和不可行的方式了，大致如下:

### 可行方案

1. `custom css selector` + `Functions & Directives`
2. `add prefix` (添加前缀)
3. `add scoped` (像 `vue` 的 `scoped` 一样添加 data-v-[hash] 类似的自定义属性，然后去修改css选择器)
4. 不打包方案 (不构建产物，直接发布，然后在项目里安装，再提取 `node_modules` 里制定的文本重新生成。)

### 不可行方案

1. module css 这会去修改 css 选择器。

## 可行方案详解

这里我写了2个`demo`分别是 `react` 和 `vue`，其中下方代码以 `vue` 为示例，`react`示例见下方的 `构建demo链接`

### custom css selector + Functions & Directives

这种方案其实非常的传统，仅仅使用到了 `tailwindcss` 中 `@apply` 和 `theme` 等等指令的功能。

比如我们有个组件 `ApplyButton.vue`，它的模板，样式和独立的 `tailwind.config.js` 分别如下所示:

```html
<script setup lang="ts">
</script>

<template>
  <button class="apply-button">ApplyButton</button>
</template>

<style src="./index.css"></style>
```

```css
@config 'tailwind.config.js';
@tailwind utilities;

.apply-button {
  @apply text-white p-4 rounded;
  background-color: theme("colors.sky.600")
}
```

```js
const path = require('node:path')

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.resolve(__dirname, './index.vue')],
  // ...
}
```

然后在打包的时候，以这个文件或者导出文件(`index.ts`) 为打包入口即可。

这样它的产物css中，选择器由于是你自己定义的，就能尽可能保证它是独一无二的。

它对应的`css`产物为:

```css
.apply-button {
  border-radius: 0.25rem;
  --tw-bg-opacity: 1;
  background-color: rgb(2 132 199 / var(--tw-bg-opacity));
  padding: 1rem;
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
```

### add prefix

这个也很好理解，前缀嘛，各个UI库都是这样搞的，我们就可以创建出以下的代码:

```html
<script setup lang="ts">
</script>

<template>
  <button class="ice-bg-sky-600 ice-text-white ice-p-4 ice-rounded">PrefixButton</button>
</template>

<style>
@config 'tailwind.config.js';
@tailwind utilities;
</style>
```

```js
const path = require('node:path')

/** @type {import('tailwindcss').Config} */
export default {
  prefix: 'ice-',
  content: [path.resolve(__dirname, './index.vue')],
}
```

它对应的`css`产物为:

```css
.ice-rounded {
  border-radius: 0.25rem;
}
.ice-bg-sky-600 {
  --tw-bg-opacity: 1;
  background-color: rgb(2 132 199 / var(--tw-bg-opacity));
}
.ice-p-4 {
  padding: 1rem;
}
.ice-text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
```

### add scoped

这个就是通过同时添加html标签属性和修改css选择器来做的了:

```html
<script setup lang="ts">
</script>

<template>
  <button class="bg-sky-600 text-white p-4 rounded">ScopedButton</button>
</template>

<style scoped>
@config 'tailwind.config.js';
@tailwind utilities;
</style>
```

这里仅仅给 `style` 加了一个 `scoped` 属性

```js
const path = require('node:path')

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.resolve(__dirname, './index.vue')],
}
```

`css` 生成结果为:

```css
.rounded[data-v-10205a53] {
  border-radius: 0.25rem;
}
.bg-sky-600[data-v-10205a53] {
  --tw-bg-opacity: 1;
  background-color: rgb(2 132 199 / var(--tw-bg-opacity));
}
.p-4[data-v-10205a53] {
  padding: 1rem;
}
.text-white[data-v-10205a53] {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}
```

### 不打包

以上三种方式总结一下，都是通过在选择器上下功夫来制作组件库的，而且它们都有一个打包的过程，即 `src`->`dist` 然后发布 `dist`

可是这第四种方案就不怎么一样了: 核心就是 `不打包`

即我们写好组件之后，直接把 `npm`的入口文件，指向 `src` ，然后直接把里面的组件发布(比如直接发布 `vue`组件)

这种情况下，你需要让你在 `node_modules` 里的组件再次经受一遍 `js` 的处理，比如 `vue sfc compiler`,`babel`,`swc`等等。

同时你也需要配置你项目里的 `tailwind.config.js` 去提取你 `node_modules` 里的组件源代码内容:

```diff
module.exports = {
  content: [
    './index.html',
    './src/**/*.{html,js,ts,jsx,tsx,vue}',
+   './node_modules/mypkg/src/components/**/*.{html,js,ts,jsx,tsx,vue}'
  ]
}
```

这样才能重新提取生成 `css` 在项目主`css chunk`里。

## 构建demo链接

<https://github.com/sonofmagic/weapp-tailwindcss/tree/main/how-to-build-components-by-tailwindcss>

## 相关 issues

<https://github.com/sonofmagic/weapp-tailwindcss/issues/247>
