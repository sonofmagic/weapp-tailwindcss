# group 和 peer 使用限制

## group 使用注意事项

在 `tailwindcss` 中，我们常常会这样写:

```html
<div class="group">
  <view class="bg-pink-400 group-hover:bg-yellow-400">
    group tapped
  </view>
</div>
```

这样在最外层的 `div` 进入 `hover` 状态时，内部的子元素中的 `group-hover` 就会生效，从而改变样式。

然而，在小程序中，伪类 `:hover` 是不起作用的，取而代之的是 `hover-class` 这样一个属性，所以这种情况我们可以这么写：

```html
<view class="group" hover-class="tapped">
  <view class="bg-pink-400 group-[.tapped]:bg-yellow-400">
    group tapped
  </view>
</view>
```

这样在 `group` 进入 `hover` 状态时，`bg-yellow-400` 就会生效了。

相关 issue：[#14](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template/issues/14)

## peer 使用注意事项

我们一般使用 `peer` 来标记一个元素，再使用各种 `peer-*` 来让它后续兄弟节点的样式生效。这些主要生成大量包含 `~` [后续兄弟选择器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Subsequent-sibling_combinator) 的 `css` 代码。

然而很不幸，在小程序中 `~` 这个选择器非常容易报错，它前面只能跟 `class` 选择器，不能跟伪类，不然会报错:

```scss
// 报错
// .xxx:invalid~.xxx-invalid:visible {
//   visibility: visible;
// }
// 不报错
.xxx~.xxx-invalid:visible {
  visibility: visible;
}
```

所以你需要就不要使用 `peer` 这个特性，如果需要此特性请使用内嵌 `class` 的方式来使用:

```html
<view>
  <view class="w-20 h-20 peer bg-gray-300" hover-class="tapped" />
  <view class="w-20 h-20 peer-[.tapped]:bg-red-400 bg-blue-400"></view>
</view>
```

> 前一个方块按压后进入 `hover` 状态 ，后面那个就变成红色。

## 出现 unexpected token "~" 错误

出现这个错误后，你应该把对应报错的相关 `peer`、`peer-*` 删掉，注意是删掉，请不要注释，因为 `tailwindcss` 中也会从注释中提取字符串，所以注释掉是没有效果的。

删掉之后，你需要重新启动一下你的应用（例如 `yarn dev:weapp`），不然导致错误的 `css` 还是会存在，导致项目挂掉。
