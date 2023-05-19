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

---

最近我把 `demo` 文件夹，变成了一个 `monorepo` 来控制所有的子项目。

运行需要在当前目录，执行 `yarn`，这样就会把所有 `sub repo` 的 `npm`包安装好。

如果出现运行报错的问题，你可以把对应的 `demo` 项目 `copy` 出来单独运行，比如这个 [issue#63](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/63)

## 升级指令

```bash
yarn upgradeInteractive --latest
```
