# 技术演进

目前 `weapp-tailwindcss` 使用:

- `babel` 来处理 `js`/`wxs`
- `htmlparser2` 来处理 `wxml`
- `postcss` 来处理 `wxss`

## wxml

使用 `htmlparser2` 已经是 `v2` 版本后期的事情了

一开始使用的是 `@vivaxy/wxml` 这是一个 `wxml` 的 `ast` 工具

但是它已经很久没有更新了，在遇到内联的 `wxs` 的时候，会直接挂掉

后续使用正则来出来，但是 正则 同样是有问题的，比如这样一个 case:

`<view class="{{2>1?'xxx':'yyy'}}"></view>`

由于 `2>1`的存在，它会提前匹配并进行返回，所以还是要使用 `ast` 工具才能做到精确。

而 `parse5` 对 html5 是严格的匹配，不怎么适用于 wxml

所以最终选择 `htmlparser2` 来处理 `wxml`

## babel

这里主要有1个演进原先是

`@babel/parser`->`@babel/traverse`->`@babel/generator`

但是这样，相当于重新生成了一遍用户的 js，同时 sourcemap 也会错乱

所以后续改成了 `@babel/parser`->`@babel/traverse`->`magic-string#replace` 的方式，做精确匹配

## postcss

这里的演进比较多，也就是相当于加入了多个 postcss 插件进行转换。
