---
title: 组件外部样式类（externalClasses）的支持
sidebar_label: externalClasses 支持
description: 自定义组件使用 externalClasses 时 tailwindcss 样式拆分的问题与解决方案。
keywords:
  - externalClasses
  - tailwindcss
  - 微信小程序
---

:::warning 快速结论
如果在自定义组件里写了 `my-class="bg-[#fafa00] text-[40px]"`，但调试器里看到变成了 `my-class="bg- #fafa00  text- 40px"` 并导致样式失效，请在插件配置中为 `customAttributes` 显式声明 `my-class`。
:::

## 典型现象

在封装原生自定义组件时经常会用到外部样式类（`externalClasses`）。例如：

```js
/* custom-component.js */
Component({
  externalClasses: ['my-class'],
})
```

在页面里直接使用 `tailwindcss` 工具类：

```html
<custom-component my-class="bg-[#fafa00] text-[40px]" />
```

小程序开发者工具会把 `my-class` 中的样式拆开成 `bg- #fafa00  text- 40px`，最终导致样式全部失效。

## 根本原因

插件默认只会转译 `class` 和 `hover-class`。外部样式类属于自定义属性，如果没有配置 [`customAttributes`](/docs/api/options/important#customattributes)，就不会被识别处理。

## 解决方案

在插件选项里增加自定义属性的映射即可：

```js
customAttributes: {
  '*': ['my-class'],
}
```

- `*` 代表匹配所有标签，你也可以改成具体的标签名或正则表达式。
- 支持传入 `Object` 或 `Map`，用于灵活地映射标签与属性的关系。

:::tip 多个外部样式类
如果组件同时暴露 `['my-class', 'title-class']`，直接把它们都写进同一个数组即可。
:::

## 扩展阅读

- 微信官方文档：[外部样式类](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#外部样式类)
- 插件配置项说明：[customAttributes](/docs/api/options/important#customattributes)

> 使用正则进行自定义匹配标签时，需要传入一个 `Map`，其中正则作为 `key`，数组作为 `value`。
