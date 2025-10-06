# Tailwindcss 原子类维护指南

## 前言

很多开发者，看到 `Tailwindcss` 的写法，或者初步使用它的时候，第一感觉可能就是 `写是真的爽，维护火葬场`。

诚然，软件工程中没有银弹，原子化有原子化的问题，但这不意味着像 `Tailwindcss`/`Unocss` 这类工具背后的原子化 `CSS` 思想本身没有价值。

最起码，原子化 `CSS` 在一定程度上帮助我们解决了: 类的命名，复用，以及迁移的问题，甚至也能避免了一定程度上的样式污染。

但是这似乎也带来了代码冗余，可读性差的问题。所以接下来的内容就是来帮助大家更好的认识，和维护 `Tailwindcss` 原子类。

## 语义化 CSS

首先要声明的是，原子化 `CSS` 和内联 `CSS` 一点关系都没有！内联 `CSS` 的优先级更高，但是复用性，可维护性要差很多。

其次 原子化CSS 不是绝对意味着一个 `class` 对应着一条CSS声明(`Declaration`)，比如 `w-0` 对应 `width: 0px;`

但是 `line-clamp-2` (效果为文字超过2行显示 `...` ) 这类一个就对应多个`CSS` 声明:

```css
.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

所以原子化 `CSS` 中的原子化三个字，实际上指代的是 `CSS` **语义上** 效果的原子化。

## 本质

就本质上而言，其实不论是 `Tailwindcss` 还是 `Unocss`，你都可以把它们想象成一个漏斗，它们从你编写的代码中，通过正则，匹配到符合规则的字符串，然后再生成对应的 `CSS`，就这么简单。

其中，`Tailwindcss` 大部分时候是作为 `postcss` 插件来使用的，它可以和众多 `postcss` 插件很好的配合起来使用。

而 `Tailwindcss` 中的 `@tailwind` 指令，本质上也就是把当前 `@tailwind` 所在文件所属的 `Tailwindcss` 上下文中的 `base`,`components`,`utilities` 这些 `layer` 依次展开罢了。

所以你在一个文件里这样写:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
/* 再写一遍 @tailwind 会导致重复展开，造成大量的代码冗余 */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

是没有意义的行为。

但是假如你通过 `@config` 指令，给不同CSS文件指定 `tailwindcss` 配置文件，类似于:

```css
/* app.css 文件, 应用全局的 tailwind.config.js */
@tailwind base;
@tailwind components;
@tailwind utilities;
/* prose.css 文件,应用当前文件下的 tailwind.prose.config.js */
@config "./tailwind.prose.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

那么，这种一个项目，多 `tailwindcss` 配置，多 `tailwindcss` 上下文的方式，将给你带来很大的自由性。

## 类名冗余问题

类名冗余可能是我们使用 `Tailwindcss` 中经常遇到的问题，比如下面这段 `HTML`:

```html
<div class="w-80 rounded-2xl bg-gray-100">
  <div class="flex flex-col gap-2 p-8">
    <input placeholder="Email" class="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2 focus:ring-offset-gray-100" />
    <label class="flex cursor-pointer items-center justify-between p-1">
      Accept terms of use
      <div class="relative inline-block">
        <input type="checkbox" class="peer h-6 w-12 cursor-pointer appearance-none rounded-full border border-gray-300 bg-white checked:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2" />
        <span class="pointer-events-none absolute start-1 top-1 block h-4 w-4 rounded-full bg-gray-400 transition-all duration-200 peer-checked:start-7 peer-checked:bg-gray-900"></span>
      </div>
    </label>
    <label class="flex cursor-pointer items-center justify-between p-1">
      Submit to newsletter
      <div class="relative inline-block">
        <input type="checkbox" class="peer h-6 w-12 cursor-pointer appearance-none rounded-full border border-gray-300 bg-white checked:border-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2" />
        <span class="pointer-events-none absolute start-1 top-1 block h-4 w-4 rounded-full bg-gray-400 transition-all duration-200 peer-checked:start-7 peer-checked:bg-gray-900"></span>
      </div>
    </label>
    <button class="inline-block cursor-pointer rounded-md bg-gray-700 px-4 py-3.5 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 active:scale-95">Save</button>
  </div>
</div>
```

这段代码看着看着就晕了，虽然你可以通过 `class` 很直观的了解到了每个元素的样式，但是数量一多，理解成本还是会指数级上升的。

为了缓解这个问题，`Windicss` / `Unocss` 还设计了 [Attributify 模式](https://unocss.dev/presets/attributify#attributify-mode)，使得它们可以依据属性进行分组归类，使得原子化类显得非常直观:

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
```

而且 `Unocss` 还利用它能够在编译时，改变用户代码的能力，构建了许多转化语法糖，比如 `transformer-variant-group`:

```html
<div class="hover:(bg-gray-400 font-medium) font-(light mono)"/>
```

这些在一定程度上，都能缓解类名冗余的问题，但是无法解决这个问题。

那么，在 `Tailwindcss` 遇到这样的问题，应该如何处理呢？

## 最简单方式: `@apply` 提取

[`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply) 是 `Tailwindcss` 里的一个 `CSS` 指令，它可以把多个原子类给合并到一个你自定义的 `CSS` 节点中。

而且，写法上它也遵从 `HTML` 里的写法。你可以很容易的从 `HTML` 中复制你的原子类到 `CSS` 中，再把它们提取成一个单独的类。

```css
@layer components {
  /* 使用 utilities 里的 inline-flex-center */
  .btn {
    @apply inline-flex-center font-bold py-2 px-4 rounded cursor-pointer;
  }
  /* 使用 components 里的 btn */
  .btn-pink {
    @apply btn bg-pink-600 hover:bg-pink-900 text-white;
  }
}

@layer utilities {
  .inline-flex-center {
    @apply inline-flex items-center justify-center;
  }
}
```

效果如下所示:

<div class="inline-flex-center gap-2 mb-3">
<button class="btn">btn</button>
<button class="btn-pink">btn-pink</button>
</div>



这样，通过提取和组合，我们可以对原子类进行更高程度上的封装，值得一提的是 `Tailwindcss` 中最流行的 UI 框架: `daisyUI` 原理上也是类似的，不过它进行了进一步的处理和预提取，并最终把它们封装成了一个 `Tailwindcss` 插件罢了。

最终，我们把大量的原子化类，进行提取组合，并最终提炼出了原子化的CSS组件 `card`,`label`,`btn`,`input`组件，那么上面的 `HTML` 就被改造成了:

```html
<div class="card bg-base-200 w-80">
  <div class="card-body">
    <input placeholder="Email" class="input input-bordered" />
    <label class="label cursor-pointer">
      Accept terms of use
      <input type="checkbox" class="toggle" />
    </label>
    <label class="label cursor-pointer">
      Submit to newsletter
      <input type="checkbox" class="toggle" />
    </label>
    <button class="btn btn-neutral">Save</button>
  </div>
</div>
```

此为最简单，最直接的方式去减小类名的冗余程度，但是这种方式也存在一定的缺陷。比如 `@apply` 这种本质上还是基于 `CSS AST` 的，用得多会有性能问题，另外智能提示也不友好。

所以刚开始可以这样使用，到出现性能问题的时候，我们就需要进行更高一部分的封装: 提炼成 Tailwindcss 插件

## 提炼成 Tailwindcss 插件

`Tailwindcss` 官方文档实际上希望我们把样式，提炼成 [Tailwindcss Plugin](https://tailwindcss.com/docs/plugins)

这样做有许多的好处，比如智能提示友好，性能也比 `@apply` 要高。

它的编写方式也非常简单:

```js
const plugin = require('tailwindcss/plugin')

module.exports = {
  plugins: [
    plugin(function({ addUtilities, addComponents, e, config }) {
      addUtilities({
        '.content-auto': {
          'content-visibility': 'auto',
        },
        '.content-hidden': {
          'content-visibility': 'hidden',
        },
        '.content-visible': {
          'content-visibility': 'visible',
        },
      })
    }),
  ]
}
```

其中 `addUtilities`/`addComponents`/`matchUtilities`/`matchComponents` 这些函数都是用来添加对应的样式到 `tailwindcss` 中。

它们参数中，添加的 `CSS` 对象遵从 [`CSS-in-JS 语法`](https://tailwindcss.com/docs/plugins#css-in-js-syntax)。

幸运的是，我们无需重新编写代码，便可以直接把之前 `@apply` 部分的代码，转化成 `CSS-in-JS` 对象。这一切都只需要我们用到 [`postcss-js`](https://github.com/postcss/postcss-js) 这个工具。

[`postcss-js`](https://github.com/postcss/postcss-js) 作为 `postcss` 生态的组成部分，它能够解析 `CSS-in-JS` 对象，同样它也能够把 `postcss` 解析的 `AST` 转化成 `CSS-in-JS` 对象。

所以它自然可以把 `CSS` 字符串，直接转化成 `CSS-in-JS` 对象。这正是我们想要达到的效果。大体的执行脚本如下:

```js
const postcss = require('postcss')
const path = require('path')
const fs = require('fs')
const tailwindcss = require('tailwindcss')
const postcssJs = require('postcss-js')

async function main () {
  const { root } = await postcss([
    tailwindcss()
  ]).process('@tailwind components;' + `@layer components{
    .btn{
      @apply inline-block cursor-pointer rounded-md bg-gray-700 px-4 py-3.5 text-center text-sm font-semibold uppercase text-white transition duration-200 ease-in-out  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-95;
    }
    /* more... */
  }`,
    {
      from: undefined
    })
  fs.writeFileSync(path.resolve(__dirname, './output.json'), JSON.stringify(postcssJs.objectify(root)), 'utf8')
}

main()
```

对应的 `tailwind.config.js` 添加 `raw` 来提取 `btn` 类。

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [{
    raw: 'btn'
  }],
}

```

当然这是保存到本地磁盘的方式，接着我们编写的 `Tailwindcss Plugin` 只需要去引用这样的对象，把它们作为参数添加到 `addUtilities`/`addComponents` 中，即可正常使用。

例如这样的生成结果为:

```json
{
  ".btn": {
    "display": "inline-block",
    "cursor": "pointer",
    "borderRadius": "0.375rem",
    "--tw-bg-opacity": "1",
    "backgroundColor": "rgb(55 65 81 / var(--tw-bg-opacity))",
    "paddingLeft": "1rem",
    "paddingRight": "1rem",
    "paddingTop": "0.875rem",
    "paddingBottom": "0.875rem",
    "textAlign": "center",
    "fontSize": "0.875rem",
    "lineHeight": "1.25rem",
    "fontWeight": 600,
    "textTransform": "uppercase",
    "--tw-text-opacity": "1",
    "color": "rgb(255 255 255 / var(--tw-text-opacity))",
    "transitionProperty": "color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter",
    "transitionDuration": "200ms",
    "transitionTimingFunction": "cubic-bezier(0.4, 0, 0.2, 1)"
  },
  ".btn:focus-visible": {
    "outline": "2px solid transparent",
    "outlineOffset": "2px",
    "--tw-ring-offset-shadow": "var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color)",
    "--tw-ring-shadow": "var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color)",
    "boxShadow": "var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000)",
    "--tw-ring-offset-width": "2px"
  },
  ".btn:active": {
    "--tw-scale-x": ".95",
    "--tw-scale-y": ".95",
    "transform": "translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))"
  }
}
```

不过这种方式其实也完全可以更进一步，接下来进入下一个章节: `postcss` 预生成产物。

## postcss 预生成产物

其实在上一章中，我们已经使用到了一些预先生成的思想了。

毕竟 `tailwindcss` 本身不过是个 `postcss` 插件，我们自然可以通过编写脚本的方式，预先的把 `CSS` 先生成出来，直接交给项目进行使用的。

比如我们要从 `utilities` 提炼出一些 `flex` 相关的工具类出来，那么我们就可以写一段脚本:

```js
const path = require('path')
const fs = require('fs')
const postcss = require('postcss')
const tailwindcss = require('tailwindcss')

async function main () {
  const { css } = await postcss([
    tailwindcss()
  ]).process('@tailwind utilities',
    {
      from: undefined
    })
  fs.writeFileSync(path.resolve(__dirname, './output.css'), css, 'utf8')
}

main()
```

对应的 `tailwind.config.js` 配置:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [{
    raw: 'flex flex-1 flex-none flex-auto flex-initial'
  }],
}
```

生成的 `output.css` 产物

```css
.flex {
    display: flex
}
.flex-1 {
    flex: 1 1 0%
}
.flex-auto {
    flex: 1 1 auto
}
.flex-initial {
    flex: 0 1 auto
}
.flex-none {
    flex: none
}
```

所以按照这种方式，我们也可以把之前那些 `@apply` 直接复制过来，进行处理，生成出 `CSS`，交给项目来进行使用。同样也能通过这种方式来提炼出 `CSS` 组件。或者把插件里面的 `CSS` 代码，比如 `daisyUI` 里面的样式给 “倒出来”。

## `Unocss` 对比 `Tailwindcss`

`Unocss` 相比 `Tailwindcss` 强大之处，在于 `Tailwindcss` 仅仅只是一个 `postcss` 插件，而 `Unocss` 不是。

`Tailwindcss` 功能简单到，它只是从我们的源代码 `(content)` 中，提取到字符串，然后去生成 `CSS` 节点。

而 `Unocss` 更多时候作为一个打包插件去使用，它可以复用我们打包的产物，并从里面进行提取字符生成  `CSS` 节点，甚至它有能力去修改我们的代码 `(transformer)`。这样的能力 `Tailwindcss` 是不具备的，这也是 `Unocss` 快且功能丰富的原因。

不过单纯这样比较是没有意义的，就像名义上 `Unocss` 快是因为它不用解析 `AST`，但是你一旦想用到 `@apply` 这样的  `directives` 功能，`Unocss` 也不可避免的去使用 `css-tree` 去解析和操纵 `AST`。而这个功能是作为 `postcss` 插件的 `Tailwindcss` 内置的，而 `Unocss` 需要额外的包去实现。

所以比较公平的比较方式，应该是用 `Unocss` 的 `postcss` 插件来和 `Tailwindcss` 做比较。

不过，作为 `Windi CSS` 思路继承者的 `UnoCSS`，在原子化 `CSS` 各个方面都做的更加极致也是不争的事实。而且由于作者 `antfu` 在国内国外的高人气，也吸引了许多志同道合的开发者，积极的为 `UnoCSS` 做贡献，使得生态也生机勃勃，未来可期，真是羡煞旁人啊!

而 `Tailwindcss` 作为一个成功商业化的开源产品，虽然不如 `UnoCSS` 激进，但出的比较早，相对来说生态更丰富，使用人数更多一些，相对应的前人踩过的坑，解决方案也完备一些，而且有公司和资金支持，理论上不会烂尾。

所以希望 `Unocss` 多为我们探索更多原子化的极限，也希望 `Tailwindcss` 多争点气，虚心多学习学习别人的优势。

## More

更多的方法论 Coming Soon...
