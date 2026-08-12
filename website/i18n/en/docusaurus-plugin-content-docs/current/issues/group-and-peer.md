---
title: Group and peer usage restrictions
description: 'In tailwindcss, we often write like this:'
keywords:
  - FAQ
  - Troubleshooting
  - compatibility
  - group
  - peer
  - Usage restrictions
  - issues
  - group and peer
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# Group and peer usage restrictions

## Notes on using group

In `tailwindcss`, we often write like this:

```html
<div class="group">
  <view class="bg-pink-400 group-hover:bg-yellow-400">
    group tapped
  </view>
</div>
```

In this way, when the outermost `div` enters the `hover` state, the `group-hover` in the inner child elements will take effect, thus changing the style.

However, in the mini program, the pseudo class `:hover` does not work, and is replaced by an attribute such as `hover-class`, so in this case we can write like this:

```html
<view class="group" hover-class="tapped">
  <view class="bg-pink-400 group-[.tapped]:bg-yellow-400">
    group tapped
  </view>
</view>
```

In this way, when `group` enters the `hover` state, `bg-yellow-400` will take effect.

Related issue: [#14](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template/issues/14)

## Notes on using peer

We generally use `peer` to mark an element, and then use various `peer-*` to make the styles of its subsequent sibling nodes effective. These mainly generate a lot of `~` code containing `css` [Subsequent Sibling Selector] (https://developer.mozilla.org/zh-CN/docs/Web/CSS/Subsequent-sibling_combinator).

Unfortunately, in small programs, the `~` selector is very easy to report errors. It can only be preceded by the `class` selector, not pseudo-classes, otherwise an error will be reported:

```scss
// Report an error
// .xxx:invalid~.xxx-invalid:visible {
//   visibility: visible;
// }
// Don't report an error
.xxx~.xxx-invalid:visible {
  visibility: visible;
}
```

So you either don't use the `peer` feature. If you need this feature, please use it by embedding `class`:

```html
<view>
  <view class="w-20 h-20 peer bg-gray-300" hover-class="tapped" />
  <view class="w-20 h-20 peer-[.tapped]:bg-red-400 bg-blue-400"></view>
</view>
```

> After pressing the previous square, it enters the `hover` state, and the subsequent one turns red.

## unexpected token "~" error occurs

After this error occurs, you should delete the related `peer` and `peer-*` that correspond to the error. Note that it is deleted. Please do not comment, because `tailwindcss` will also extract strings from comments, so commenting out has no effect.

After deleting it, you need to restart your application (for example, `yarn dev:weapp`), otherwise the `css` that caused the error will still exist, causing the project to crash.
