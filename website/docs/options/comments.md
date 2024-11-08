# js 中的精确转化与忽略

默认对所有 `jsx`、`js`、`wxml`、`wxss` 中出现的 `tailwindcss` 运行时工具类进行转化，如果不需要转化可以使用 `weappTwIgnore` 标识符来进行忽略:

例如:

```js
<view :class="classArray">classArray</view>

// weappTwIgnore 就是 String.raw ，所以它的结果就是后面字符串的结果
const weappTwIgnore = String.raw
const classArray = [
  'text-[30rpx]',
  weappTwIgnore`bg-[#00ff00]`
]

```

此时只有 `'text-[30rpx]'` 会被转化，`'bg-[#00ff00]'` 会被忽略。
