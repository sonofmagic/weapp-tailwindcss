# js的精确转化与忽略

默认对所有 `jsx`,`js`,`wxml`,`wxss`中出现的`tailwindcss`运行时工具类进行转化，如果不需要转化可以使用 `/*weapp-tw ignore*/` 前置注释。

例如:

```js
<view :class="classArray">classArray</view>
const classArray = [
  'text-[30rpx]',
  /*weapp-tw ignore*/ 'bg-[#00ff00]'
]
```

此时只有 `'text-[30rpx]'` 会被转化，`'bg-[#00ff00]'`被忽视
