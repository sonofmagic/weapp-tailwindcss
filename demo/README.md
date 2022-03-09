# 注意事项

`demo` 里所有的 `WebpackPlugin` 相关引用都指到了，源码里的编译结果(`dist`)去了

在实际使用时，需要将引用补上，比如:

```js
// vue.config.js
const { UniAppWeappTailwindcssWebpackPluginV4 } = require('../..')
// 改成
const { UniAppWeappTailwindcssWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin')
```

这样就能够顺利的跑起来了。
