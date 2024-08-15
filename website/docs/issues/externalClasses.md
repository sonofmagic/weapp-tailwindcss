# 外部样式类（externalClasses）的支持

在封装原生自定义组件的时候，我们经常会使用外部样式类（`externalClasses`），相关使用方式参阅[官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/wxml-wxss.html#%E5%A4%96%E9%83%A8%E6%A0%B7%E5%BC%8F%E7%B1%BB)

我们以一个例子来介绍，一个原生组件定义一个或多个外部样式类：

```js
/* 组件 custom-component.js */
Component({
  externalClasses: ['my-class']
})
```

然后你传入 `tailwindcss` 样式，去使用下方的写法：

```html
<custom-component my-class="bg-[#fafa00] text-[40px]" />
```

你会发现，在自定义组件中的 `my-class="bg-[#fafa00] text-[40px]"` 样式在微信开发者工具的调试窗口中，格式变成了 `my-class="bg- #fafa00  text- 40px`。

这样直接导致了样式不生效了！

## 解决方案

这是因为，你没有配置插件的 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 配置项导致的。

这个配置，可以用来额外转译一些 `wxml` 上的额外标签属性，否则默认只会转译 `class` 和 `hover-class`。

它可以传入一个 `Object` 或者 `Map`，可以自定义匹配的标签，和任意匹配的属性。

比如上面一个 `case` 就只需给插件的 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 传入:

```js
customAttributes: {
  '*': ['my-class']
}
```

就能够进行 `my-class` 的转译，当然这里使用 `*` 代表所有标签都匹配，你可以使用正则自定义匹配的标签，和匹配的属性。

> 使用正则进行自定义匹配标签时，需要传入一个 `Map`，其中正则作为 `key`, 数组作为 `value`。

你可以在 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 看到它的具体配置方法。
