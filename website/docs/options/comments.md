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

> 默认情况下仅会忽略与 `weappTwIgnore` 有直接关系的标记模板，例如从包里导入后重命名、或在同一文件里一路别名过去的写法。简单的 `String.raw` 别名会继续参加转译，防止误杀。

如果需要自定义别名，可以包装一层函数并在配置里显式加入该别名，例如：

```js
const alias = (...args) => String.raw(...args)
// 在 ignoreTaggedTemplateExpressionIdentifiers 中加入 'alias'
```

或者直接使用 `ignoreTaggedTemplateExpressionIdentifiers` 配置追加其它标识符。
