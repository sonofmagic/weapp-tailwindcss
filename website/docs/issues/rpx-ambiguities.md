# rpx 任意值颜色或长度单位二义性与解决方案

## 这是一个什么问题？

在不使用 `weapp-tailwindcss` 的情况下，你直接写这样的 `rpx` 写法：

```html
<div class="text-[32rpx]"></div>
```

最终它会生成这样的 `css`：

```css
.text-\[32rpx\] {
  color: 32rpx
}
```

为什么 `rpx` 这个好端端的长度单位，会变成颜色呢？

原因在于 `rpx` 不是一个标准的 `W3C` 规定的 `CSS` 长度单位，这是微信小程序自己定的 `WXSS` 单位。

而 `tailwindcss` 在针对具有**二义性**的任意值写法，例如以下单位:

- `text-[]`
- `border-[]`
- `bg-[]`
- `outline-[]`
- `ring-[]`

这些会去校验**括号**内的任意值，是否为有效的 `CSS` 长度单位写法！

如果为 `true`，则生成出长度 `css` 节点，反之则生成出颜色 `css` 节点:

```css
/* text-[16px] */
.text-\[16px\] {
    font-size: 16px
}
/* text-[#fafafa] */
.text-\[\#fafafa\] {
    --tw-text-opacity: 1;
    color: rgb(250 250 250 / var(--tw-text-opacity))
}
```

那么问题来了，`rpx` 在单位校验的时候，由于不认识这个单位，导致单位无效所有被分到了颜色组，所以造成了这个问题！那么如何解决呢？

## 目前插件的 hack 方案

目前，我做了一个解决方案，我在 `weapp-tailwindcss` 植入了一个逻辑，使得插件可以通过分析 `tailwindcss` 运行时代码，来打上支持 `rpx` 单位的补丁，使得 `tailwindcss` 支持这样的写法，生成出长度单位的 `css`。

这也是为什么要让大家去执行 `weapp-tw patch` 的原因。

这个解决方案直到最新的 `3.3.3` 版本，都是有效的。

然而，以后 `tailwindcss` 将会使用由 `rust` 编写的新引擎。

这时候这种 `hack` 方式将会失效，毕竟那种情况下都是二进制文件了！

那么为了预防这种可能出现的危机，我们应该怎么做呢？

## 解决方案

我们可以在使用这些带有**二义性**的单位的时候，通过 `length` 或 `color` 这种的前缀来指定它应该是什么，例如：

```html
<div class="text-[22rpx]">...</div>
<div class="text-[#bada55]">...</div>
<!-- 变成下列的写法 -->
<div class="text-[length:22rpx]">...</div>
<div class="text-[color:#bada55]">...</div>
```

这样就通过指定的方式，直接跳过了长度单位校验，生成出长度单位的 `css` 了！

```css
.text-\[length\:22rpx\] {
    font-size: 22rpx
}
```

同样你可以使用这 2 个前缀来指定 `css` 变量的生成形式：

```html
<!-- 生成 font-size  -->
<div class="text-[length:var(--my-var)]">...</div>

<!-- 生成 color -->
<div class="text-[color:var(--my-var)]">...</div>
```

## 参见

- `tailwindcss` 中的[添加自定义样式](https://tailwindcss.com/docs/adding-custom-styles#resolving-ambiguities)
- 相关 Issue：[#110](https://github.com/sonofmagic/weapp-tailwindcss/issues/110)、[#110](https://github.com/sonofmagic/weapp-tailwindcss/issues/109)