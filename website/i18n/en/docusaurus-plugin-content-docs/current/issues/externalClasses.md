---
title: Support for component external style classes (externalClasses)
sidebar_label: externalClasses support
description: Problems and solutions for tailwindcss style splitting when custom components use externalClasses.
keywords:
  - externalClasses
  - tailwindcss
  - WeChat applet
  - Component external style class
  - customAttributes
  - style split
  - Plug-in configuration
  - FAQ
---

:::warning Quick conclusion
If you write `my-class="bg-[#fafa00] text-[40px]"` in a custom component, but see it changed to `my-class="bg- #fafa00  text- 40px"` in the debugger and the style becomes invalid, please explicitly declare `customAttributes` for `my-class` in the plug-in configuration.
:::

## Typical phenomenon

External style classes (`externalClasses`) are often used when encapsulating native custom components. For example:

```js
/* custom-component.js */
Component({
  externalClasses: ['my-class'],
})
```

Use the `tailwindcss` tool class directly in the page:

```html
<custom-component my-class="bg-[#fafa00] text-[40px]" />
```

The mini program developer tool will split the styles in `my-class` into `bg- #fafa00  text- 40px`, which will eventually cause all styles to become invalid.

## root cause

By default, the plugin will only translate `class` and `hover-class`. External style classes are custom attributes. If [`customAttributes`](/docs/api/options/important#customattributes) is not configured, they will not be recognized and processed.

## Solution

Just add custom attribute mapping in the plug-in options:

```js
customAttributes: {
  '*': ['my-class'],
}
```

- `*` means matching all tags, you can also change it to a specific tag name or regular expression.
- Supports passing in `Object` or `Map` for flexibly mapping the relationship between tags and attributes.

:::tip Multiple external style classes
If the components expose `['my-class', 'title-class']` at the same time, just write them all into the same array.
:::

## Further reading

- WeChat official document: [External style class](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#External style class)
- Plug-in configuration item description: [customAttributes](/docs/api/options/important#customattributes)

> When using regular expressions to customize matching tags, you need to pass in an `Map`, where the regular expression is `key` and the array is `value`.
