---
title: '@weapp-tailwindcss/typography'
description: Mini program @tailwindcss/typography rich text rendering solution
keywords:
  - Community
  - template
  - Case
  - weapp-tailwindcss
  - typography
  - community
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# @weapp-tailwindcss/typography

Mini program `@tailwindcss/typography` rich text rendering solution

`@weapp-tailwindcss/typography` is a small program migration version of `@tailwindcss/typography`, which helps you render beautiful rich text.

<iframe src="//player.bilibili.com/player.html?aid=751356751&bvid=BV16k4y1S7nY&cid=1408037969&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## introduce

In mini programs, we often use the [rich-text](https://developers.weixin.qq.com/miniprogram/dev/component/rich-text.html) component, then request the `html` string fragment from the backend, and then put it into the mini program for rendering, as shown:

```html
<rich-text nodes="{{nodes}}"></rich-text>
```

However, there are many restrictions on using it. For example, if the `rich-text` component is used in a custom component, only the `wxss` style of the custom component will take effect on the `rich-text` in `class`.

Therefore, `case` was designed for this kind of `@weapp-tailwindcss/typography` to solve the problem of small programs rendering rich text.

## How to use?

### Install

```sh npm2yarn
npm i -D @weapp-tailwindcss/typography
```

### register

This is special, due to the style restrictions of the `rich-text` component: if the `rich-text` component is used in a custom component, then only the `wxss` style of the custom component will take effect on the `rich-text` in `class`

#### Create components

Here we take the `uni-app vue3 vite` project as an example. For example, our target component is `typography.vue`:

```html
<template>
  <rich-text class="prose" :nodes="nodes"></rich-text>
</template>

<script lang="ts" setup>
// getHtml method to get html for you
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

#### Create an independent tailwindcss context

In the current `typography.vue` component directory, create a separate `tailwind.typography.config.js` to create an independent `tailwindcss` context and process it separately.

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

At this point rendering `html` takes effect.

#### Specify global style configuration file

In order to prevent the Tailwind configuration of this page from affecting the global entry, the configuration file in the root directory needs to be explicitly specified.

At this time, in your entry file (`tailwindcss`) that introduces `App.vue`, declare that it uses `tailwind.config.js` in the root directory.

```css
@config "../tailwind.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

This configuration is finally completed.

> When using @import, please note that the loading order is different, see https://tailwindcss.com/docs/functions-and-directives#config for details

## Configuration items

The general configuration items are the same as https://tailwindcss.com/docs/typography-plugin

Added additional `mode` and `classPrefix`

## Principle explanation

`@weapp-tailwindcss/typography/transform` This method is to add the `html` attribute to all your `class` elements, so that you can use those `prose-headings:bg-red-100` and `prose-h5:text-green-400` writing methods to overwrite the original rich text style.

And `@weapp-tailwindcss/typography` is configured by `mode`, `mode` is `tag`, which represents the original default behavior, and `mode` is `class`. At this time, the plug-in is changed to take effect on all `class` selectors instead of all tags. The default value is `class`

If you think `@weapp-tailwindcss/typography/transform` is too large to be processed on the applet, you can put it in the `nodejs` service and process it in advance.

## Demo

<**PROTECTED_0**>
