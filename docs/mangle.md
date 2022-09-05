# mangle 详细配置

`mangle` 用于压缩混淆所有的 `className`，比如默认会把 `dom` 上的 `className` 转化为：

- `flex` -> `a`
- `w-[200rpx]` -> `b`
- `text-[rgba(255,255,0,1)]` -> `c`

当然，你也可以自定义混淆生成的所有 `className`。

## 配置项

`Typescript dts` 类型为

```ts

const mangle : boolean | IMangleOptions

export interface IMangleOptions {
  /**
   * 保留指定的className
   */
  reserveClassName?: (string | RegExp)[]
  /**
   * 自定义className生成器,返回 `undefined` 为使用默认的生成器
   */
  classGenerator?: (original: string, opts: IMangleOptions, context: Record<string, any>) => string | undefined
  /**
   * 开启console.log打印用于调试
   */
  log?: boolean
  /**
   * 排除指定路径下的文件，优先级高于 include
   */
  exclude?: (string | RegExp)[]
  /**
   * 包括指定路径下的文件，优先级低于 exclude
   */
  include?: (string | RegExp)[]
  /**
   * 忽略指定的className，不进行转化(重要!!!!，见文档详细配置项)
   */
  ignoreClass?: (string | RegExp)[]
}
```

当 `mangle` 为 `false` 为不开启此功能

当 `mangle` 为 `true`，默认生效的配置项为：

```ts
{
  exclude: [/node[-_]modules/, /(wx|my|swan|tt|ks|jd)components/]
}
```

此配置项意义为，默认不处理第三方UI库中的所有 `className`。

如果你想保留 `css` 选择器不让被替换，可以使用 `/* mangle disabled */` 注释或者 `/* mangle ignore */` 注释，效果是一样的：

```css
/* mangle disabled */
.el-tree-node__content {
  color: red;
}
```

## 详细配置项

### reserveClassName

接受一个 `(string | RegExp)[]`，这个配置项和生成的 `className` 有关。

默认的生成器生成出来的 `className` 为 `a`,`b`,`c`,`d` .... `aa`,`ba`,`ca`.......

当你想预留一些 `class` 的空间来避免重名时，你可以使用此选项。

### classGenerator

自定义`className`生成器

接受三个参数:

1. `original`: 原始的 `className`
2. `opts`:`IMangleOptions` 配置项
3. `context`: 上下文，用于保存状态

返回值为新的`className`, 返回 `undefined` 为使用默认的生成器生成新的名称。

例如：

```js
classGenerator: (original, opts, context) => {
  // 初始化id值
  if (!context.id) {
    context.id = 0
  }
  if (original.startsWith('icebreaker-')) {
    const className = `ice${context.id}`
    context.id++
    return className
  }
}
```

则相当于把 `icebreaker-` 这个前缀开始的 `class` 都给混淆了。

### log

`boolean`,开启命令行显示，用于展示 `oldClass` -> `newClass`:

```txt
Minify class name from w-32 to wa
Minify class name from py-2 to xa
Minify class name from rounded-md to ya
Minify class name from font-semibold to za
Minify class name from text-white to _a
Minify class name from ring-4 to ab
Minify class name from ring-pink-300 to bb
Minify class name from test to cb
```

### exclude

`(string | RegExp)[]`，排除指定路径下的文件，优先级高于 `include`

默认为 `[/node[-_]modules/, /(wx|my|swan|tt|ks|jd)components/]`

### include

`(string | RegExp)[]`，包括指定路径下的文件，优先级低于 `exclude`

### ignoreClass

`(string | RegExp)[]`，忽略指定的className，不进行转化

这个配置项是非常重要的，和功能的实现方式有关。

`mangle` 功能是同时去修改 `wxml`,`wxss`,`jsx` 这类的字符串字面量。

在修改时，我会把一个一个节点分为 `静态节点` 和 `动态节点`:

```html
<view class="bg-[#123456]">bg-[#123456]</view>
<view :class="className">bg-[#123456]</view>
```

```js
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
const className = replaceJs('bg-[#123456]')
```

当前版本，只会对所有静态节点上的  `className` 进行替换，如果一个节点通过 `js` 来绑定`class`，则这个节点上，所有的 `class` 都不会被混淆替换。假如同一个 `class` 又是静态节点里被使用，又是动态节点绑定的，会直接把动态绑定的`class`对应的`css`选择器，给直接干掉。

比如上面这个 `case` 在不使用 `ignoreClass` 配置项时，`replaceJs('bg-[#123456]')` 绑定的节点，样式就是不生效的，因为选择器已经变成了：

```css
.a{
  background-color: #123456;
}
```

此时，你需要把 `'bg-[#123456]'` 字面量或者对应的一个或者多个正则表达式，声明在 `ignoreClass` 中：

```js
{
  ignoreClass: ['bg-[#123456]',/^text-/]
}
```

来避免 `mangle` 对 `className` 进行压缩混淆。
