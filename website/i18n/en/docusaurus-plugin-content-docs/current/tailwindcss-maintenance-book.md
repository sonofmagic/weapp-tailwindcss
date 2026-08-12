---
title: Tailwindcss Atomic Class Maintenance Guide
description: When many developers see how Tailwindcss is written, or first use it, their first impression may be that it is really fun to write and maintain the crematorium.
keywords:
  - Tailwindcss
  - Atomic Class Maintenance Guide
  - tailwindcss maintenance book
  - weapp-tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# Tailwindcss Atomic Class Maintenance Guide

## Preface

When many developers see how `Tailwindcss` is written, or when they first use it, their first impression may be `It’s really fun to write，Maintain crematorium`.

It is true that there is no silver bullet in software engineering, and atomization has problems with atomization, but this does not mean that the atomization `Tailwindcss` idea behind tools like `Unocss`/`CSS` itself has no value.

At the very least, atomic `CSS` helps us solve the problems of class naming, reuse, and migration to a certain extent, and can even avoid a certain degree of style pollution.

But this also seems to bring about problems of code redundancy and poor readability. So the next content is to help everyone better understand and maintain the `Tailwindcss` atomic class.

## Semantic CSS

The first thing to say is that atomizing `CSS` has nothing to do with inlining `CSS`! Inline `CSS` has a higher priority, but its reusability and maintainability are much worse.

Secondly, atomic CSS does not absolutely mean that an `class` corresponds to a CSS statement (`Declaration`), such as `w-0` corresponds to `width: 0px;`

However, one such `line-clamp-2` (the effect is that the text is displayed in more than 2 lines `...`) corresponds to multiple `CSS` statements:

```css
.line-clamp-2{
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
```

Therefore, the three words atomization in atomization `CSS` actually refer to the atomization of the **semantic** effect of `CSS`.

## Essence

In essence, whether it is `Tailwindcss` or `Unocss`, you can think of them as a funnel. They match the strings that conform to the rules from the code you write through regular rules, and then generate the corresponding `CSS`. It is that simple.

Among them, `Tailwindcss` is used as the `postcss` plug-in most of the time, and it can be used well in conjunction with many `postcss` plug-ins.

The `Tailwindcss` instruction in `@tailwind` essentially expands the `@tailwind` `Tailwindcss`, `base`, and

So you write this in a file:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
/* Writing @tailwind again will lead to repeated expansion, resulting in a lot of code redundancy */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

It is meaningless behavior.

But if you pass the `@config` directive to specify the `tailwindcss` configuration file for different CSS files, similar to:

```css
/* app.css file, application global tailwind.config.js */
@tailwind base;
@tailwind components;
@tailwind utilities;
/* prose.css file, apply tailwind.prose.config.js under the current file */
@config "./tailwind.prose.config.js";
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Then, this approach of one project, multiple `tailwindcss` configurations, and multiple `tailwindcss` contexts will bring you great freedom.

## Class name redundancy problem

Class name redundancy may be a problem we often encounter when using `Tailwindcss`, such as the following `HTML`:

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

This code makes me dizzy just looking at it. Although you can intuitively understand the style of each element through `class`, as the number increases, the cost of understanding will still increase exponentially.

In order to alleviate this problem, `Windicss` /

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

Moreover, `Unocss` also uses its ability to change user code at compile time to build many conversion syntactic sugars, such as `transformer-variant-group`:

```html
<div class="hover:(bg-gray-400 font-medium) font-(light mono)"/>
```

These can alleviate the problem of redundant class names to a certain extent, but they cannot solve this problem.

So, how should we deal with such problems in `Tailwindcss`?

## The simplest way: `@apply` extraction

[`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply) is an `Tailwindcss` instruction in `CSS`, which can merge multiple atomic classes into a custom `CSS` node.

Moreover, the writing method also follows the writing method in `HTML`. You can easily copy your atomic classes from `HTML` into `CSS` and extract them into a separate class.

```css
@layer components {
/* Use inline-flex-center in utilities */
  .btn {
    @apply inline-flex-center font-bold py-2 px-4 rounded cursor-pointer;
  }
/* Use btn in components */
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

The effect is as follows:

<div class="inline-flex-center gap-2 mb-3">
<button class="btn">btn</button>
<button class="btn-pink">btn-pink</button>
</div>

Through extraction and combination, atomic classes can be encapsulated into more stable component styles. `daisyUI` has a similar idea, except that it pre-organizes these styles into a Tailwind CSS plug-in.

Finally, we extracted and combined a large number of atomized classes, and finally refined the atomic CSS components `card`, `label`, `btn`, and `input` components. Then the above `HTML` was transformed into:

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

This is the simplest and most direct way to reduce the redundancy of class names, but this method also has certain flaws. For example, `@apply` is essentially based on `CSS AST`. If used too much, there will be performance problems, and the smart prompts are not friendly.

So it can be used like this at the beginning. When performance problems arise, we need to carry out a higher level of encapsulation: refine it into a Tailwindcss plug-in

## Refined into Tailwindcss plug-in

The official documentation of `Tailwindcss` actually wants us to refine the style into [Tailwindcss Plugin](https://tailwindcss.com/docs/plugins)

This has many advantages, such as friendly smart prompts and higher performance than `@apply`.

The way it is written is also very simple:

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

Among them, `addUtilities`/`addComponents`/`matchUtilities`/`matchComponents` are used to add corresponding styles to `tailwindcss`.

Among their parameters, the added `CSS` object conforms to [`CSS-in-JS grammar`](https://tailwindcss.com/docs/plugins#css-in-js-syntax).

Fortunately, we can directly convert the previous `@apply` part of the code into an `CSS-in-JS` object without rewriting the code. All this requires is the tool [`postcss-js`](https://github.com/postcss/postcss-js).

[`postcss-js`](https://github.com/postcss/postcss-js) As a component of the `postcss` ecosystem, it can parse `CSS-in-JS` objects. It can also convert `postcss` parsed by `AST` into `CSS-in-JS` objects.

So it can naturally convert the `CSS` string directly into the `CSS-in-JS` object. This is exactly what we want to achieve. The general execution script is as follows:

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

Corresponding to `tailwind.config.js` add `raw` to extract the `btn` class.

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [{
    raw: 'btn'
  }],
}

```

Of course, this is the way to save to the local disk. Then the `Tailwindcss Plugin` we write only needs to reference such objects and add them as parameters to `addUtilities`/`addComponents`, and then it can be used normally.

For example, the generated result is:

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

However, this method can actually go further, and then move on to the next chapter: `postcss` pre-generated product.

## postcss pre-generated product

In fact, in the previous chapter, we have already used some pre-generated ideas.

After all, `tailwindcss` itself is just an `postcss` plug-in. We can naturally generate `CSS` in advance by writing scripts and directly hand it over to the project for use.

For example, if we want to extract some `utilities`-related tool classes from `flex`, then we can write a script:

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

Corresponding `tailwind.config.js` configuration:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [{
    raw: 'flex flex-1 flex-none flex-auto flex-initial'
  }],
}
```

The resulting `output.css` product

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

So in this way, we can also directly copy the previous `@apply`, process it, generate `CSS`, and give it to the project for use. The `CSS` component can also be extracted in this way. Or "pour out" the `CSS` code in the plug-in, such as the styles in `daisyUI`.

## `Unocss` vs `Tailwindcss`

The power of `Unocss` compared to `Tailwindcss` is that `Tailwindcss` is just an `postcss` plug-in, while `Unocss` is not.

The function of `Tailwindcss` is so simple that it just extracts the string from our source code `(content)`, and then generates the `CSS` node.

`Unocss` is more often used as a packaging plug-in. It can reuse our packaged products and extract characters from them to generate `CSS` nodes. It even has the ability to modify our code `(transformer)`. `Tailwindcss` does not have such capabilities, which is why `Unocss` is fast and feature-rich.

However, it is meaningless to compare simply like this. Just like `Unocss` is nominally faster because it does not need to parse `AST`, but once you want to use `@apply` functions such as `directives`, `Unocss` will inevitably use `css-tree` to parse and manipulate `AST`. This function is built-in to `postcss` as the `Tailwindcss` plug-in, while `Unocss` requires additional packages to implement it.

Therefore, a fair comparison method should be to use the `Unocss` plug-in of `postcss` to compare with `Tailwindcss`.

`UnoCSS` continues many of the ideas of `Windi CSS` and goes further in the on-the-fly generation, presets and transformers of atomic CSS. Its community is also very active, and many features will be verified here first.

`Tailwindcss`’s route is more conservative, but its ecology is larger, with more existing projects and third-party components. It's also often easier to find ready-made solutions when you encounter common problems.

The two are not simply substitutes. New projects can be selected based on team preference; existing Tailwind CSS projects are more suitable to straighten out scanning, component encapsulation and build boundaries first.

## More

More methodologies Coming Soon...
