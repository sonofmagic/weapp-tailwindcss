---

title: 'tailwindcss in weapp 的原理'
---


(2023-03-19) 版本，现在看了一下，已经比较老了，有空再改进改进。

## 前言

笔者对 `tailwindcss` 这一类库的理解还算比较深刻。之前就已经撰写并发布过相关的许多包，比如像 [`tailwindcss-miniprogram-preset`](https://github.com/sonofmagic/tailwindcss-miniprogram-preset), [`weapp-tailwindcss-webpack-plugin`][weapp-link] [等等大堆的包](https://github.com/sonofmagic?tab=repositories&q=tailwindcss&type=&language=&sort=)。

最近我发布了 [`weapp-tailwindcss-webpack-plugin`][weapp-link] 的 `2.0.0`版本，增加了一些核心特性。想着现在也是时候，回顾总结一下这个插件的原理和历程了。回首`npm`版本发布历史，看到当年发布的第一个正式版，还是在 `2022/2/3` 号，到现在也已经过去了`1`年多的时间了，想想岁月真是如白驹过隙，等着等着我们就老了。

## 这个插件是做什么的？

简单概括一下，就是把 `tailwindcss` 相关的特性，带入进小程序开发中。

为什么需要它呢？核心原因就是，小程序这个平台不像`h5`那么自由，有很多各式各样的束缚与非标准化的 `API`。我们以微信小程序为例：

同`css`相比，`wxss`有着更少的选择器支持，同`wxml`相比，`wxml`有着更少的字符集支持，`js` 和 `wxs` 的运行也是分离的(`wxs`语法像是一个低版本`js`)。

更不用说那些该有的全局对象一个都没有了，比如 `Blob`,`File`,`FormData`, `WebSocket`,`fetch`,`XmlHttpRequest`等等了，这导致许多浏览器包，安装下来无法运行。

> 举个例子，最近我在做服务端 graphql 改造，市面上主流的 `graphql client` 直接安装运行会立即报错，因为缺少全局对象，为了兼容它们，于是就写了 [`weapp-websocket`](https://www.npmjs.com/package/weapp-websocket) 和 [`weapp-fetch`](https://www.npmjs.com/package/weapp-graphql-request) 分别来实现 `subscriptions` 和 `query/mutation`。目前在项目里使用，运转良好。

总的来说，由于缺少许多特定的对象和语法上的限制，一些在 `h5` 上通用的流行库，很有可能在小程序里跑不起来。`tailwindcss` 便是其中之一，而这个插件就能帮助你在小程序里使用它。

## 原理篇

### utility-first CSS framework

其实吧，市面上的 `tailwindcss`/`windicss`/`unocss` 做的是一回事情。如果用比喻来形容，那么它们就是个带着滤网的字符串漏斗。它们对开发者编写的代码文件内容进行读取，并分割成海量的字符串放入漏斗中，然后经过滤网的过滤，符合条件的就去生成原子类，其余的"残渣"则忽略。

其中 `tailwindcss` 大多作为 `postcss plugin` 来使用的，它源码里自己实现了一个文件读取机制(也就是 `tailwind.config.js` 中的 `content` 配置项 )，来对我们编写的代码进行提取。

而 `windicss`/`unocss` 则是依赖 `webpack/rollup/vite` 这类的 `bundler`，在打包的过程中获取到 `Source / Asset / Chunk` 这类的对象，从而提取字符串的。虽然目前 `windicss`/`unocss` 都有对应的 `postcss plugin` 的实现，但是它们大多都是作为实验性质的，并不能很好的复刻它们打包插件的体验。

是什么造成了它们的不同呢？

这点其实就要说到 `unocss/windicss` 它们的优点了。目前 `tailwindcss postcss plugin` 实际上只有**读**的能力，它来读取我们写的代码，生成原子类。而 `windicss`/`unocss` 它们大多作为一个 `webpack/vite/rollup plugin` 来使用的，所以它们不但拥有读的能力，还拥有**修改**的能力。所以它们能写出这样的代码:

```html
<button 
  bg="blue-400 hover:blue-500 dark:blue-500 dark:hover:blue-600"
  text="sm white"
  font="mono light"
  p="y-2 x-4"
  border="2 rounded blue-200"
>
  Button
</button>
<div m-2 rounded text-teal-400 />
```

实际上就是在打包的插件内，展开覆写罢了，本质上还是个语法糖。

另外目前你选择这种原子类框架的时候，要不选择 `tailwindcss` 要不就 `unocss`，目前看起来 `windicss` 已经死了。

### 小程序兼容

上面说了这么多，接下来来聊聊它们对小程序的兼容，事实上，市面这么多转义的插件，预设啥的，都是一回事。

思路大多就是把这些原子类`css`框架，生成的 `class` 通过重命名，转义，再覆写的方式，去兼容小程序环境。

说的具体一些，就是对打包后的产物进行修改，把其中的 `wxml` 里开发者撰写的 `className` 进行转义，把 `js` 里写的要应用到 `dom` 节点上的 `className` 也进行转义，同时还要对 `wxss` 里生成的 `css` 选择器进行转义。

而这些核心中的核心，便是转义后类名和选择器，一定要相互匹配！！不然生成的结果就是完全错误的。

## 笔者的实现

前面说了这么多，接下来来讲讲我自己的实现。

实际上我一开始的实现也很简单，在第一版本初期，我选择写了这样一个 `webpack plugin`：

1. 它内部用 `wxml ast` 来解析所有的 `wxml`模板,以此来获取所有的 `className` 进行解析和替换
2. 使用 `postcss` 来解析所有的 `wxss`，以此对所有的`css`选择器进行修改
3. 使用 `babel` 来解析所有的 `js`/`jsx`，以此来动态修改 `jsx?` 里所以满足条件的字面量 (`StringLiteral`)。

然而理想很丰满，现实很骨感，在实现的过程中，困难一个一个浮现出来了：

### js里的字面量转义很容易误伤

一开始想着直接匹配并且替换掉符合要求的 `js` 的字面量，于是便兴致勃勃从 `tailwindcss` 源码里，拷贝来了解析提取器的正则，并在打包后进行匹配和替换。

然而这个方案失败了，原因是`tailwindcss`这个正则匹配有可能会把 `webpack` 它默认注入的一些`js code`的一些字面量，也给匹配进来，从而造成大面积误伤。这种误伤会导致 `js` 加载的失败，应用直接就挂了。所以暂时把 `js`字面量动态修改给去除掉了。同时导出了一个手动标记替换位置的方法：

```js
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
const cardsColor = reactive([
  replaceJs('bg-[#4268EA] shadow-indigo-100'),
  replaceJs('bg-[#123456] shadow-blue-100')
])
```

这样虽然解决了误伤的问题，但是带来了一些代码的入侵性，导致了开发体验不佳。不过这个问题在 `2.0.0` 解决了，请继续往下看。

### 多框架兼容

> 源码 `framework` 部分

正如你看到的，我的这个 `plugin` 是兼容市面上，几乎所有还活着的主流开发框架的。在开始设计兼容方案的过程中，我发现这些框架编译成小程序的产物各有不同，一类是以 `uni-app`/`mpx`/`native(原生)`为例，它们就是按部就班的把类 `vue` 模板的写法，转义成小程序模板写法。另外一类是以 `taro`，`rax`，`remax` 为代表的 `jsx` 写法，这种写法的产物，最大的特点就是页面与组件的 `wxml` 里往往都是这样的结构：

```html
<import src="../../base.wxml"/>
<template is="taro_tmpl" data="{{root:root}}" />
```

而 `base.wxml` 文件内则是大量的条件渲染语句，然后在 `js` 里生成一个对象传入其中，就把整个页面和逻辑渲染出来了。这个方案显然会比模板方案要灵活许多。个人总结，一种偏静态编译，一种偏动态。

所以开始写的时候插件也分成了 `2` 个版本，一个是 `TemplatePlugin` 专门用来处理偏静态的这种框架，一个是 `JsxPlugin` 负责动态的方案。这 `2` 种插件的侧重点不同，一个主要替换模板代码，一个则主要转义 `jsx`，就开发难度来说 `jsx` 插件要难上许多。

#### 模板插件

> 源码 `base/BaseTemplatePlugin` 和 `wxml` 部分

模板那个插件，要做的是解析所有的 `dom` 的 `class` 属性，但是这个属性里很有可能会存在 `js`表达式(`{{}}`包裹的部分)。

如果是不带表达式的，可以直接转义覆写，带表达式的会稍微复杂一点，我需要去预估开发者所使用的语法，比如开发者经常会使用一些数组绑定的语法，或者多元条件运算符，例如 `x?y:z?a:b` 来撰写类名。这就代表着我们需要像解析 `js` 那样去解析 `{{}}` 内部包着的表达式，再通过语法的检测去进行替换。

比如 `x?y:z?a:b` 派生的 `{{ flag ? 'bg-[#123456]' : otherFlag ? 'text-[50px]' : 'text-[#654321]' }}` 我们就需要匹配 `3` 个字面量进行转义。

#### jsx插件

> 源码 `base/BaseJsxPlugin` 和 `jsx` 部分

这个插件的开发难度更高，因为我发现就单单 `taro` 一个框架，它就支持 `react`/ `preact`/ `vue2` / `vue3` 这些框架，要命的是，`react`/`vue2`/`vue3` 它们构建出来的产物，有很大的不同。

> 这点你可以通过我 `src/jsx` 目录下的源码，和相应的`jest`单元测试快照，查看它们的差别。

所以我在配置项里，除了原先的 `appType`(框架) 之外又加了一个 `framework` 专门提供给 `taro`，通过传入 `react/vue2/vue3` 让它们走各自不同的 `jsx?` 替换策略。

当然这样远远没有解决问题，毕竟原先插件是在 `processAssets` 这个`hook`去执行的核心逻辑，相比较来说还是偏晚的，还可能有误伤的问题存在。为此我做了一些努力：

1. 在替换字面量时，只匹配 `react/vue2/vue3`的`return`模板部分代码，放弃函数作用域内字面量的匹配和替换。
2. 为了让这个转义替换的范围足够的精确，就必须要尽可能的提前执行。于是基于这个思路，我想到了在插件里，动态去插入一个自己的 `webpack-loader`:`jsx-rename-loader` (见源码 `src/loader` )

这个 `loader` 会被动态的插入 `jsx?` 文件的加载读取序列中，并确保它在队列的最先执行，即 `babel-loader` 或 `ts-loader` 之前。这样在这个`loader`内部执行转义的时候，得到的原始内容就非常贴近用户自己编写的代码了。

#### webpack4/5 和 vite 的兼容

> 源码 `base` -> `v4/v5` 部分

这一块也是由于各个框架，使用的 `webpack` / `postcss` 版本不同导致的。

不过要达成这个目标还是比较简单的，看看`webpack`文档就可以了，而 `rollup/vite` 这种，它们本身的 `API` 就要比 `webpack` 简单，实现起来也非常简单。

具体举一些例子便是:

```js
// webpack5 动态插入 loader
import { NormalModule } from 'webpack'
NormalModule.getCompilationHooks(compilation).loader.(pluginName, (loaderContext, module) => {})
// webpack4
compilation.hooks.normalModuleLoader.tap(pluginName, (loaderContext, module) => {})

// webpack5
compilation.hooks.processAssets
// webpack4
compilation.hooks.optimizeChunkAssets

// webpack5
const Compilation = compiler.webpack.Compilation
const { ConcatSource } = compiler.webpack.sources
// webpack4
import { ConcatSource, Source } from 'webpack-sources'
// 还有 `loader-utils` 的版本问题
import { getOptions } from 'loader-utils'
// 还有 Compilation 封闭后 assets 对象不可修改问题等等等等
```

这种问题只要愿意多调试，都能解决。

### css 选择器替换

> 源码 `postcss` 部分

这部分是 `postcss` 的主场，我们知道 `postcss` 本质上就是一个 `css ast` 工具。有了 `ast` 才有了各种各样的转化插件来生成 `css`。

现在我们使用它的核心目标为：找到所有 `tailwindcss` 的生成块，对选择器进行转义。

我们先来解决第一个问题: 怎么找？

#### 找到tailwindcss节点

> 源码 `postcss/mp` 部分

各个框架，它们公共样式文件的路径不同的。比如 `uni-app` 的路径就是 `common/main.wxss`，`taro` 则为 `app.wxss` ，而某些框架更加的奇葩，`common/miniprogram-app.wxss` 等等，这简直就是简直了。

所以我们可以通过用户传入的 `appType` 这个框架类型，以此来精确定位公共样式的位置。不过这个方案后续还经过了许多的优化，核心便是利用 `postcss` 解析，对 `tailwindcss` 所在的文件位置，进行猜测。

这个猜测的方案是由于 `tailwindcss` 的特性实现的。因为 `tailwindcss` 它在生成原子类之前，它会先去注入大量的 `css` 变量，以此来控制所有的原子类的呈现。

所以我们会看到这样一个 `css` 节点

```css
*,:after,:before{
  --tw-border-spacing-x: 0;
  --tw-border-spacing-y: 0;
  --tw-translate-x: 0;
  --tw-translate-y: 0;
  --tw-rotate: 0;
  /* ..... */
}
```

那么我们就可以认为，找到它，这个文件就是公共样式的所在之处了。不过在寻址时要注意选择器条件和 `-tw-` 变量条件，以此做到精确匹配。

#### 转义原子类选择器

> 源码 `postcss/selectorParser` 和 `shared` 部分

第一个问题解决了，第二个问题接踵而至，怎么换？

直接对所有的选择器进行转义可行吗？显然是不可行的，这只会导致 `css` 的大面积误伤。

我们知道一个`css`选择器，可能很简单也可以很复杂，它可以包含相邻兄弟选择器，子选择器，后代选择器，通用兄弟选择器，伪类选择器，伪元素选择器，还能使用 `,` 来添加选择器。我们必须要对选择器进一步解析，从而做到精确匹配和转义。

这时候就需要 `postcss-selector-parser` 出场了。

我们在使用 `postcss` 进行 `root.walk` 之后，再把符合条件的 `css` 节点进行 `selectors.walk`，从而达成了选择器局部精确转义的效果。

另外由于 `tailwindcss` 默认的 `preflight` 是针对 `h5` 的，所以我们也需要注入自己的小程序 `preflight`，还有一点值得注意就是， `js/wxml` 的转义方法和 `wxss` 的转义方法是不同的，因为 `css` 中，往往会多加一个 `\` 字符。

### 模板解析的重新实现

> 源码 `reg` 和 `wxml/utils` 部分

原先用的 `wxml ast` 是第三方的，已经彻底没人维护了，一直出 `bug`(比如`wxml`内联`wxs`)，于是自己基于正则写了一个模板属性提取器。

这是由于日益增长的需求导致的，原先可能想着模板里，只要支持 `class`/ `hover-class` 这类的属性转义就够了。但是后续发现，用户在定义和使用组件的时候，也会经常把 `className` 作为属性传入进组件，这时候就需要我们自定义生成正则，来对满足条件的属性进行转义了。比如:

```html
<my-com class="bg-[#123456]" hover-class="bg-[#654321]" custom-class="text-[#ff00ff]" happy-attr="text-[green]" sad-attr="text-[blue]"></my-com>
```

默认只匹配转义 `2` 个，怎么行呢？所以开放了 `customAttributesEntities` 配置项，这个配置项会和原先 `class`/ `hover-class` 相关的属性一起进行匹配，从而转化上述例子中所有的 `Arbitrary values`。

### 动态源码补丁

> 源码 `tailwindcss` 部分

很多时候，出于 `tailwindcss` 自身的限制，和技术国情等等原因。我们的 `pr` 往往不会被他们接受，这时候我们就需要自己去修改他们的源码，从而封装一个符合中国国情的 `tailwindcss`。这种可以通过 `fork` 一个新的版本进行发布来做到，也可以通过给源码打补丁做到。

> 注意点：给源码打补丁，这个操作一定要是幂等的，不然重复执行可能会破坏源码的结构

#### 支持自定义长度单位(rpx)

> 源码 `tailwindcss/supportCustomUnit` 部分

自从 `tailwindcss 3.2.x` 开始，由于加入了单位分类校验 [issue#110](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110) 导致原先一些直接在类名里写 `rpx` 的原子类，被错误识别然后被转化成了颜色。

什么意思呢？

比如现在有三个原子类，`text-[#123]`，`text-[30rpx]`，`text-[30px]`，在 `3.2.x` 之前，前一个是字体颜色，后面两个是字体的大小。在这个版本之后，前 **2** 个是颜色，只有最后一个是字体大小了！

这是因为 `tailwindcss` 会对 `mdn` 上合法长度单位进行校验，在合法长度单位列表内，则认为是字体大小，反之则为字体颜色。而 `rpx` 这个单位是微信的独创，不是一个标准的 `css` 单位，自然就在合法长度单位这个集合之外了。

那么如何进行修复支持呢？通过阅读 `tailwindcss` 的源码，会发现它校验单位的方法在 `utils/dataType.js` 这个文件里。

再通过 `babel` 三件套: `parse`，`traverse`,`generate` 可以精确锁定暴露的合法变量列表位置，然后把 `rpx` 这个单位 `push` 进 `ast node.elements`之后，重新生成覆写即可。

## 2.0 增加了什么？

这个版本新增了 `UnifiedWebpackPluginV5`
和 `UnifiedViteWeappTailwindcssPlugin` 这种以 `Unified` 开头的插件。

它们能够自动识别并精确处理所有 `tailwindcss` 的工具类，这意味着它可以同时处理 `wxss`,`wxml` 和 `js` 里静态和动态的 `class`(v1版本只有处理`wxss`,`wxml`静态`class`的能力)。所以你再也不需要在 `js` 里引入并调用 `replaceJs`方法了！由于 `2.x` 插件有精准转化 `js`/`jsx` 的能力，误伤问题得到了有效的解决，也大大提升了 `taro` 这种动态模板框架的开发体验。

欢迎体验，`star`/`fork`。

## 尾言

正如马克·吐温的名言： `To a man with a hammer, everything looks like a nail`。

笔者的方案肯定也会有许多的局限性，本篇文章也不可避免的会出现许多的勘误。

欢迎大佬们指出，也欢迎大家的建议和指点 ^_^

作者: [ice breaker](https://github.com/sonofmagic)

[weapp-link]: https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin
