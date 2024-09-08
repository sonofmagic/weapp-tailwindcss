# 模块化风格

## 始终 esm

在 模块化风格 风格上，推荐大家始终使用 `esm` 的语法，即 `import/export` ，而不是 `cjs` 的 `require/module.exports`

```ts
// good
import x from 'x'
import 'xx'
export default x
export {
  x,
  y,
  z
}
// bad
const x = require('x')

module.exports = x
```

## cjs / esm 格式混用问题

这个问题常见在 使用 `esm` 去引入一个 `cjs` 模块:

```js
// apple.js
module.exports = {
  a,
  b,
  c
}
```

然后使用 `import` 引入

```js
// error ! 这种写法会报错，因为 esm 无法解构
import { a, b, c } from './apple'
```

```js
// 你应该改成下方这种写法
import * as apple from './apple'
const { a, b, c } = apple
```
