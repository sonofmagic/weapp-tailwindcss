# mangle 配置

用于压缩混淆所有的 `className`，类似:

- `flex` -> `a`
- `w-[200rpx]` -> `b`
- `text-[rgba(255,255,0,1)]` -> `c`

当然，你可以自定义混淆生成的所有 `className`

> 当前版本，只会对所有静态节点上的  `className` 进行替换，如果一个节点通过 `js` 来绑定`class`，则这个节点上，所有的 `class` 都不会被混淆替换。

Typescript 类型为

```ts

const mangle : boolean | IMangleOptions

export interface IMangleOptions {
  /**
   * 保留指定的className
   */
  reserveClassName?: (string | RegExp)[]
  /**
   * 自定义className生成器
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
   * 忽略指定的className
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
