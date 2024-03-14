# Nodejs API

> 版本 2.11.0+ , 此为高阶 `api`，使用起来有难度，不适合新手，假如你不清楚你在做什么，请使用 `webpack/vite/gulp` 插件

有时候,我们不一定会使用 `webpack/vite/gulp`，可能是直接使用 `nodejs` 去构建应用，或者封装更高阶的工具，这时候可以使用`api`去转义你的应用。

## 如何使用

```js
// mjs or
import { createContext } from 'weapp-tailwindcss/core'
// cjs
const { createContext } = require('weapp-tailwindcss/core')

async function main(){
  // createContext 可传入参数，类型为 UserDefinedOptions
  const ctx = createContext()
  // 3.1.0 开始 api 都是异步的，为 rust 工具链做准备
  // (!!!废弃)(在之前)transformWxss 是异步的，其他2个为同步 (!!!废弃)
  const wxssCode = await ctx.transformWxss(rawWxssCode)
  const wxmlCode = await ctx.transformWxml(rawWxmlCode)
  const jsCode = await ctx.transformJs(rawJsCode)
  // 传入参数和输出结果均为 字符串 string

  // 然后你就可以根据结果去复写你的文件了
}

main()
```

:::tip
有一点要特别注意，在使用 `ctx.transformJs` 的时候，一定要确保 `tailwindcss` 已经执行完毕了！也就是说对应的 `postcss` 执行完毕。

因为 `js` 的转义依赖 `tailwindcss` 的执行结果，然后根据它，再去从你的代码中找到 `tailwindcss` 提取出的字符串，再进行处理的。

假如此时 `tailwindcss` 还没有执行，则插件就只能获取到一个 **空的** 提取字符串集合，这就无法进行匹配，从而导致你写在 `js` 里的类名转义失效。

比如这种情况:

```js
// index.js
const classNames = ['mb-[1.5rem]']
```

另外使用此种方式，编译缓存需要自行处理，且暂时没有类名的压缩与混淆功能
:::
