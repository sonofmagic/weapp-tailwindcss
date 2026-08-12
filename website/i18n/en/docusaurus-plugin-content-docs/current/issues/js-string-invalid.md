---
title: Any value of tailwindcss written in js is invalid
description: weapp-tailwindcss allows you to write any value in js, and weapp-tailwindcss will automatically help you translate any value.
keywords:
  - FAQ
  - Troubleshooting
  - compatibility
  - written in
  - js
  - in
  - tailwindcss
  - Any value is invalid
  - issues
  - js string invalid
  - weapp-tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
---

# Any value of tailwindcss written in js is invalid

`weapp-tailwindcss` allows you to write any value in `js`, and `weapp-tailwindcss` will automatically help you translate any value.

for example:

```js title="src/pages/index/index.js"
const xs = {
  wrapper: 'px-[4px] h-[40px]',
}
```

Then in the final product, the compilation result will automatically become

```js title="dist/pages/index/index.js"
const xs = {
  wrapper: 'px-_4px_ h-_40px_',
}
```

But your file must be perceived by `tailwindcss` and these `2` `class` can be extracted from it. `weapp-tailwindcss` can complete the translation of these `tailwindcss` `2` through communication with `class`.

Therefore, your source file must be included by `@source` before the automatic translation process can be completed.

Otherwise, `js` translation will not be performed, causing the following to appear when inspecting elements in the developer tools:

```html
<view class="px- 4px  h- 40px "></view>
```

This is the case where the class name is cut off.

## Solution

Check your `@source` to make sure you have source files with class names cut off, included by `@source`.

Document address: https://tailwindcss.com/docs/detecting-classes-in-source-files#explicitly-registering-sources

The current documentation only maintains Tailwind CSS 4 access instructions.

`tailwindcss`
