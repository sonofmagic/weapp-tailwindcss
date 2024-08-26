# 类名的压缩与混淆

自从版本 2.3.0+ 开始，配置项中添加了 `mangle` 选项，传一个 `true` 这样的布尔值，即可开启对 `tailwindcss` 生成类名的混淆和压缩。

## 为什么需要这样这个配置项呢？

有时候我们会写出这样的 `class`：

```html
<view
  class="bg-[url(https://pic1.zhimg.com/v2-3ee20468f54bbfefcd0027283b21aaa8_720w.jpg)] bg-[length:100%_100%] bg-no-repeat w-screen h-[41.54vw]">
</view>
```

显然，这样的 `class` 是有效的，然而原始长度实在是太长了，经过转义后，假如里面包含 `unicode`，那就更长了，所以我们需要对这种进行压缩。

开启这个选项之后，这个元素的编译结果就变成了如下所示：

```html
<div class="tw-g tw-h tw-i tw-d tw-e"></div>
```

同时，对应的 `js` 和 `css` 选择器也被同时修改，以做到同步。这样生成的包的大小比较小，而且其他开发者也不能一眼看出样式了，因为类名已经被混淆过了。

## 自定义

如果你对生成类名的结果不满意，我也提供了许多的配置项帮助你自定义修改类名

例如你对 `tw-` 这样的类名前缀不满意，那么可以传:

```js
const options = {
  // ...
  mangle:{
    classGenerator: {
      classPrefix: '' // 这里就写你想要的前缀
    }
  }
}
```

或者你有些类名不想被压缩混淆，那么就可以传入一个过滤方法 `mangleClassFilter`

```ts
const options = {
  mangle:{
    mangleClassFilter: (className:string) => boolean
  }
}
```

这个压缩混淆的能力，源自于我另外一个项目 [tailwindcss-mangle](https://github.com/sonofmagic/tailwindcss-mangle)

想要了解更多的功能和配置项可以移步查看文档，欢迎 `star` 和 `fork`

## 注意点

默认情况下，不包含 `-` 或者 `:` 的类名是不会被压缩混淆的，例如 `flex`、`relative` 这种类名。

因此压缩混淆 `js` 的字符串字面量是非常危险的一件事情，例如

```js
const innerHTML = "i'm flex and relative and grid"
document.body.innerHTML = innerHTML
```

这种情况下强行压缩混淆，那用户自己的结果就是有问题的了，所以这就是原因，当然这个默认行为，可以使用自定义的 `mangleClassFilter` 来代替。
