---
title: The principle of tailwindcss in weapp
description: Another year has passed in a blink of an eye, and I feel it’s time to revise this article on the principles of tailwindcss in weapp. Don’t worry, the core of my writing this time is to make it understandable to most people!
keywords:
  - tailwindcss
  - in
  - weapp
  - principle
  - principle
  - weapp-tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

## 2024-02-20 version

## Preface

Another year has passed in the blink of an eye, and I feel it’s time to revise this article `tailwindcss in weapp principle`. Don’t worry, the core of my writing this time is to make it understandable to most people!

## What is weapp-tailwindcss

If I define it next, I define `weapp-tailwindcss` as an **escaper**, which in my opinion does one thing. That is to convert the writing method in `tailwindcss` that is incompatible with the applet into a writing method that is compatible with the applet, and try to keep the effect of the generated `CSS` consistent.

A more detailed explanation is that it allows developers to write small programs like in the `tailwindcss` `h5` environment. The plug-in helps you convert small programs compatible with `wxml`, `js`,

That's all, I made a small effort and contribution.

## Why do we need weapp-tailwindcss?

Because files/products such as applet `wxml`, `wxss`, etc. do not support some special escape characters in `Tailwindcss`, such as `[]`,

After testing, the `class` attribute in `wxml` only supports English letters, numbers, `-`, and `_`. Unsupported characters are converted to spaces, so selectors must be rewritten into a mini-program-compatible form. This is the function implemented by the core package [`@weapp-core/escape`](https://github.com/sonofmagic/weapp-core).

For the general development history and direction of the plug-in, you can see the previous `2023-03-19` version below. I will not describe it here. Next, we will only talk about the core principles.

## Core Principles

The core of the plug-in is escaping, so how is it done specifically?

In fact, the plug-in parses the compiled products `wxml`, `js`, and `wxss` and rewrites them.

In terms of tools, `weapp-tailwindcss` uses `htmlparser2` to parse and transform `wxml`, `babel` is used to parse and transform `js` and `wxs`, and `postcss` is used to parse and transform all `wxss`.

## `wxml`

### Why `htmlparser2`

In fact, `weapp-tailwindcss` initially used `@vivaxy/wxml`, which is an `wxml` tool for `ast`.

But it has not been updated for a long time. In many scenarios, such as when encountering inline `wxs`, it will hang directly. And I do not have the technical ability to repair and improve this `wxml` automaton, so I gave up on it later. Later, I implemented a template matching engine based on regular rules, but after using it for a while, I found that `regular` also had problems, such as this `case`:

`<view class="{{2>1?'xxx':'yyy'}}"></view>`

Due to the existence of `2>1`, it will match and return `<view class="{{2>` in advance, which is not in line with our expectations. Moreover, after the regular expression is complicated, the matching efficiency is actually very low (specifically, it can be tested and debugged in [regex101](https://regex101.com/)), so it is still necessary to use the `ast` tool to achieve accurate matching and conversion while taking into account efficiency.

So, I still have to find the corresponding `xml/html ast` tool to parse `wxml`. During the search process, we found some packages that met the conditions. Among them, `parse5` is a strict match for `html5` and is not very suitable for `wxml`. `htmlparser2` is not a strict label match, so after testing, `htmlparser2` was finally used to process `wxml`.

### How to use `htmlparser2`

It's actually very simple. We can find the corresponding life cycle (`webpack`) in `vite` / `gulp` / `hooks` or our own build script to process the `wxml` product.

First, after obtaining the content of the `wxml` product, construct it into an `MagicString` object. Because of the `magic-string` library, it is very convenient to operate strings.

After parsing the product content string, obtain the contents of all `class` attributes and just escape them. The code example is as follows:

```js
import * as htmlparser2 from "htmlparser2";

const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
      // code
    },
    onclosetag(tagname) {
      // code
    },
    // ....
});
parser.write(wxmlCode);
parser.end();
```

### Processing of strings and variable bindings

However, after obtaining the contents of these tags `class` / `hover-class`, further analysis and conversion are required.

Why? Because the native applet can use the `{{expression}}` expression to dynamically bind the value of `js`, suppose there is a section of `wxml` written like this:

```html
<view class="w-[13px] {{flag?'h-[23px]':'h-[6px]'}} bg-[#123456] {{customClass}}"></view>
```

At this time, you must escape the string when matching the `class` attribute value, and then escape the `{{}}` expression wrapped in `js`, so that the result becomes:

```html
<view class="w-_13px_ {{flag?'h-_23px_':'h-_6px_'}} bg-_#123456_ {{customClass}}"></view>
```

So how to do it? It is also very simple. We can get the string `htmlparser2` by matching the `class` attribute with `w-[13px] {{flag?'h-[23px]':'h-[6px]'}} bg-[#123456] {{customClass}}`.

Then perform `{{}}` expression matching on this string, and strings outside the `{{}}` expression matching are directly escaped. The code in the `{{}}` expression is parsed using `babel`, and then all `js` string literals are obtained and escaped.

At the same time, when matching and escaping, we can actually get the subscripts of the corresponding strings `start` and `end`, which provides a good foundation for us to use `MagicString` for replacement.

## js / wxs

We also need to scan all the strings in `js` and find that they are the class names of `tailwindcss`, so they need to be escaped.

Let’s take the code snippet above as an example:

```html
<view class="w-[13px] {{flag?'h-[23px]':'h-[6px]'}} bg-[#123456] {{customClass}}"></view>
```

During the processing of `wxml`, it seems that we have solved the escaping of most of the `class` content, but developers may also directly write the class name of `customClass` in the `js` string bound to `tailwindcss`. for example:

```js
Page({
  data: {
    customClass: "bg-[url('https://xxx.com/xx.webp')] text-[#123456] text-[50px] bg-[#fff]",
  },
})
```

Or you can write the class name directly in `wxs`. So what should you do at this time? Can I get all string literals and template strings and escape them?

Obviously this is not possible. In an application, most of the string literals have nothing to do with `tailwindcss`. If they are all converted, the application will only crash.

So, is there any way for us to obtain the context of `tailwindcss`, extract all its class names from it, and then match it with the string in our application to achieve accurate escape? But `tailwindcss` is just an `postcss` plug-in. How to extract the contents of an `webpack` plug-in from the `vite` / `postcss` plug-in?

In this way, after `postcss` /

```js
let ast: ParseResult<File> = parse(rawSource, {
    sourceType: 'unambiguous'
})
const ms = new MagicString(rawSource)

const ropt: TraverseOptions<Node> = {
  StringLiteral: {
    enter(p) {
// set is all valid classnames in the tailwindcss context
      if(set.has(p.node.value)){
        // do escape
        const value = escape(p.node.value)
        ms.update(start, end, value)
      }
    },
  },
}

traverse(ast, ropt)

const code = ms.toString()
```

In this way, the string literals in `js` / `wxs` can be accurately escaped into the method allowed by the applet.

Here we use `babel` as the tool for `js ast`, because it is also the most popular package in this area so far. However, for efficiency reasons, `swc` will be used in the future and `swc` plug-ins will be written to replace `babel`.

## wxss

The last step is to deal with styles. After escaping `wxml`, In this way, we can achieve 11 correspondences between class names and achieve our ultimate goal.

So how to do it? The tool we choose here is naturally `postcss`, which is currently the most popular `js` tool written with `css ast`. It is much better than `css-tree` in terms of ecology. There are also many ready-made stable plug-ins available to help us complete various processing of `css`.

So the final work we have to complete is to transform the product of `tailwindcss` into one that matches `wxml`, `js` and `wxs` and that the applet can adapt to!

How to do it? It's also very simple. Just use `postcss` to scan all `wxss` nodes in `Rule`, then get the selector inside and escape it!

### A brief introduction to postcss objects

What is the `Rule` node? In the `postcss` plug-in, there are roughly the following `5` class objects (actually there is also an `Document`):

- `Root`: The root node of the CSS tree, which usually represents the entire CSS file.
- `AtRule`: CSS statements starting with `@`, such as `@charset "UTF-8"` or `@media (screen) {}`.
- `Rule`: Ordinary selector node, filled internally by CSS declarations, such as `.btn { /*decls*/ }`.
- `Declaration`: key-value key-value pair, representing CSS declaration, such as `color: black`;
- `Comment`: CSS comments.

See [writing-a-postcss-plugin](https://postcss.org/docs/writing-a-postcss-plugin#step-find-nodes) for details

Through these objects, `postcss` completes the abstraction of `CSS`, allowing us to add, delete, modify and query `CSS` by operating these objects.

### Tailwindcss simple principle and running performance

Before converting all `Rule` nodes, let's first analyze the principle of `Tailwindcss`. It is also an `postcss` plug-in. It extracts the `content` expression or `glob` object in the `vfile` configuration, extracts strings that comply with its rules, and then generates a large number of `AtRule` / `Rule` objects to save.

Then scan to the place where we registered `Tailwindcss`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Expand these objects and replace the original `@tailwind xxx;`, so that `CSS` will automatically generate whatever you write.

Among them, you can understand `base` / For example, `components` is responsible for all `utilities` and `layer` injections, and `AtRule` is responsible for the generation of all atomic tool classes.

At the same time, they control their priorities through `@layer`, so that `CSS` between them will not cause priority coverage conflicts.

> `@layer` is actually an experimental feature of the native `CSS`, which is used to declare a cascading layer, making it easier for developers to control the priority of their own CSS code. We can use `@layer` here because this function is implemented by `tailwindcss` in its own way, so that we can pre-use `CSS` in `@layer`. There is no `@layer` in the final product. For related documents, please see [MDN @layer](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@layer)

### Start conversion

First we simply declare a `postcss` plug-in:

```ts
import type { PluginCreator } from 'postcss'
import { ruleTransformSync } from '../selectorParser'

const creator: PluginCreator<Options> = () => {
  return {
    postcssPlugin,
    Rule(rule) {
      ruleTransformSync(rule, options)
    },
  }
}

creator.postcss = true
```

Here we encapsulate the conversion for `Rule` into the `ruleTransformSync` method:

Here we need to use `postcss-selector-parser` to make a more detailed transformation of the selector in `Rule`.

Because the selector of the `postcss` object in `Rule` is ever-changing and can be very simple or very complex, if you treat it as a string alone, problems can easily arise.

So we need `postcss-selector-parser` to parse `Rule#selector` and then modify it and convert it back to a string.

For example:

```ts
import selectorParser from 'postcss-selector-parser'
import type { Rule } from 'postcss'
import type { IStyleHandlerOptions } from '@/types'

export const ruleTransformSync = (rule: Rule, options: IStyleHandlerOptions) => {
  const transformer = selectorParser((selectors) => {
    selectors.walk((selector) => {
      // do something with the selector
    })
  })

  return transformer.transformSync(rule, {
    lossless: false,
    updateSelector: true
  })
}
```

We filter and modify the nodes in the method by `selectors` of `walk`, so as to achieve the effect of replacing and escaping `Rule#selector`.

In this way, all nodes generated by `Tailwindcss` can be escaped!

## Done

Finally, after these 3 major parts are completed, the core function of `weapp-tailwindcss` is completed!

---

## 2023-03-19 version

(2023-03-19) version, I have looked at it now and it is already quite old. I will improve it when I have time.

## Preface

The author has a relatively deep understanding of the `tailwindcss` library. I have written and released many related packages before, such as [`tailwindcss-miniprogram-preset`](https://github.com/sonofmagic/tailwindcss-miniprogram-preset), [`weapp-tailwindcss-webpack-plugin`][weapp-link] [and many more packages](https://github.com/sonofmagic?tab=repositories&q=tailwindcss&type=&language=&sort=).

Recently I released the `weapp-tailwindcss-webpack-plugin` version of [`2.0.0`][weapp-link], which adds some core features. I thought it was time to review and summarize the principles and history of this plug-in. Looking back at the release history of the `npm` version, I see that the first official version released that year was still under the `2022/2/3` number. It has been more than `1` years now. Thinking about it, the years are really fleeting, and we will grow old just waiting for it.

## What does this plug-in do?

To briefly summarize, it is to bring `tailwindcss`-related features into small program development.

Why is it needed? The core reason is that the mini program platform is not as free as `h5`, and has many various restrictions and non-standardized `API`. Let’s take the WeChat applet as an example:

Compared to `css`, `wxss` has less selector support, compared to `wxml`, `wxml` has less character set support, and `js` and `wxs` run separately (`wxs` syntax is like a lower version of `js`).

Not to mention that there are none of the global objects that should be there, such as `Blob`, `File`, `FormData`, `WebSocket`,

> For example, recently I was doing server-side graphql transformation. The mainstream `graphql client` on the market will immediately report an error when installed and run directly because of the lack of global objects. In order to be compatible with them, I wrote [`weapp-websocket`](https://www.npmjs.com/package/weapp-websocket) and [`weapp-fetch`](https://www.npmjs.com/package/weapp-graphql-request) to implement `subscriptions` and `query/mutation` respectively. Currently used in the project and working well.

In general, due to the lack of many specific objects and grammatical restrictions, some popular libraries commonly used on `h5` may not run in small programs. `tailwindcss` is one of them, and this plug-in can help you use it in mini programs.

## Principles

### utility-first CSS framework

Actually, the `tailwindcss`/`windicss`/`unocss` on the market do the same thing. To use a metaphor, they are a string funnel with a filter. They read the content of the code file written by the developer, split it into a large number of strings and put them into the funnel. Then, after filtering through the filter, atomic classes are generated for those that meet the conditions, and the remaining "residues" are ignored.

Among them, `tailwindcss` is mostly used as `postcss plugin`. Its source code implements a file reading mechanism (that is, the `tailwind.config.js` configuration item in `content`) to extract the code we wrote.

`windicss`/`unocss` relies on `webpack/rollup/vite` such as `bundler`, and obtains objects such as `Source / Asset / Chunk` during the packaging process to extract strings. Although `windicss`/`unocss` currently have corresponding implementations of `postcss plugin`, most of them are experimental and cannot replicate the experience of their packaged plug-ins.

What makes them different?

This point actually comes to `unocss/windicss` and their advantages. Currently, `tailwindcss postcss plugin` actually only has the ability to read. It reads the code we wrote and generates atomic classes. `windicss`/`unocss` are mostly used as `webpack/vite/rollup plugin`, so they not only have the ability to read, but also have the ability to modify. So they can write code like this:

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

In fact, it is just a matter of overwriting within the packaged plug-in. It is essentially syntactic sugar.

In addition, when you choose this kind of atomic class framework, you either choose `tailwindcss` or `unocss`. It seems that `windicss` is dead now.

### Compatible with mini programs

Having said so much above, let’s talk about their compatibility with small programs. In fact, there are so many escaping plug-ins on the market, and the presets are all the same thing.

Most of the ideas are to rename, escape, and then overwrite these atomic class `css` frameworks to generate `class` to be compatible with the mini program environment.

To be more specific, we need to modify the packaged product, escape the `wxml` written by the developer in `className`, escape the `js` written in `dom` that should be applied to the `className` node, and also escape the `wxss` selector generated in `css`.

The core of these cores is the escaped class name and selector, which must match each other! ! Otherwise the generated results will be completely wrong.

## Author’s implementation

Having said so much before, let’s talk about my own implementation.

In fact, my initial implementation was very simple. In the early days of the first version, I chose to write this `webpack plugin`:

1. It internally uses `wxml ast` to parse all `wxml` templates to obtain all `className` for parsing and replacement.
2. Use `postcss` to parse all `wxss` to modify all `css` selectors
3. Use `babel` to parse all `js`/`jsx` to dynamically modify all literals (`jsx?`) in `StringLiteral` that meet the conditions.

However, the ideal is very full and the reality is very skinny. In the process of realization, difficulties emerged one by one:

### Literal escaping in js is easy to cause accidental damage

At first, I thought about directly matching and replacing the literals of `js` that met the requirements, so I enthusiastically copied the regular parsing extractor from the `tailwindcss` source code, and matched and replaced it after packaging.

However, this solution failed because the regular match `tailwindcss` might match some of the literals of `webpack` injected by `js code` by default, thus causing large-scale accidental damage. This accidental injury will cause `js` to fail to load, and the application will hang directly. Therefore, the dynamic modification of the `js` literal is temporarily removed. At the same time, a method for manually marking replacement positions is exported:

```js
import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
const cardsColor = reactive([
  replaceJs('bg-[#4268EA] shadow-indigo-100'),
  replaceJs('bg-[#123456] shadow-blue-100')
])
```

Although this solves the problem of accidental injuries, it also makes some codes intrusive, resulting in a poor development experience. However, this problem has been solved in `2.0.0`, please continue reading.

### Multi-framework compatible

> Source code `framework` part

As you can see, my `plugin` is compatible with almost all mainstream development frameworks still alive on the market. When I started to design compatibility solutions, I found that the products compiled by these frameworks into small programs are different. One type is `uni-app`/`mpx`/`native(Native)` as an example. They step by step convert the writing method of class `vue` template into the writing method of small program template. The other type is the `taro` writing method represented by `remax` and

```html
<import src="../../base.wxml"/>
<template is="taro_tmpl" data="{{root:root}}" />
```

The `base.wxml` file contains a large number of conditional rendering statements, and then an object is generated in `js` and passed into it, and the entire page and logic are rendered. This solution is obviously much more flexible than the template solution. Personal summary, one is more static compilation, the other is more dynamic.

So when I started writing, the plug-in was divided into `2` versions. One is `TemplatePlugin`, which is specially used to deal with the static framework, and the other is `JsxPlugin`, which is responsible for dynamic solutions. These `2` plug-ins have different focuses. One mainly replaces the template code, and the other mainly escapes `jsx`. In terms of development difficulty, the `jsx` plug-in is much more difficult.

#### Template plug-in

> Source code `base/BaseTemplatePlugin` and `wxml` parts

What the template plug-in needs to do is parse all the `dom` attributes of `class`, but there is very likely to be an `js` expression (the part wrapped by `{{}}`) in this attribute.

If it does not have an expression, you can directly escape and overwrite it. If it does have an expression, it will be a little more complicated. I need to estimate the syntax used by developers. For example, developers often use some array binding syntax, or multiple conditional operators, such as `x?y:z?a:b`, to write class names. This means that we need to parse the expressions wrapped inside `js` just like parsing `{{}}`, and then replace them through syntax detection.

For example, if `x?y:z?a:b` is derived from `{{ flag ? 'bg-[#123456]' : otherFlag ? 'text-[50px]' : 'text-[#654321]' }}`, we need to match `3` literals for escaping.

#### jsx plugin

> Source code `base/BaseJsxPlugin` and `jsx` parts

The development of this plug-in is more difficult, because I found that the `taro` framework alone supports `react`/

> At this point, you can check the differences between them through the source code in my `src/jsx` directory and the corresponding `jest` unit test snapshot.

So in the configuration item, in addition to the original `appType` (framework), I added an `framework` specifically for `taro`, and passed in `react/vue2/vue3` to let them follow their own different `jsx?` replacement strategies.

Of course, this is far from solving the problem. After all, the core logic of the original plug-in is executed in `processAssets`, which is `hook`. Comparatively speaking, it is still late, and there may also be problems with accidental injuries. I made some efforts to do this:

1. When replacing literals, only the `react/vue2/vue3` template code of `return` is matched, and the matching and replacement of literals in the function scope are abandoned.
2. In order to make the scope of this escape replacement accurate enough, it must be executed as early as possible. So based on this idea, I thought of dynamically inserting my own `webpack-loader`:`jsx-rename-loader` in the plug-in (see source code `src/loader`)

This `loader` will be dynamically inserted into the load reading sequence of the `jsx?` file and ensure that it is executed first in the queue, that is, before `babel-loader` or `ts-loader`. In this way, when escaping is performed inside this `loader`, the original content obtained is very close to the code written by the user.

#### Compatibility between webpack4/5 and vite

> Source code `base` -> `v4/v5` part

This is also caused by the different versions of `webpack` / `postcss` used by each framework.

However, it is relatively simple to achieve this goal. Just look at the `webpack` document. As for `rollup/vite`, their own `API` is simpler than `webpack`, and it is also very simple to implement.

Some specific examples are:

```js
// webpack5 dynamically inserts loader
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
// webpack5 loader gets options directly from loader context
const options = loaderContext.getOptions()
// There is also the problem that the assets object cannot be modified after Compilation is closed, etc.
```

This kind of problem can be solved as long as you are willing to debug more.

### css selector replacement

> Source code `postcss` part

This part is the home of `postcss`, which we know is essentially an `postcss` tool. With `css ast`, there are various conversion plug-ins to generate `ast`.

Now our core goal of using it is to find all generated blocks of `tailwindcss` and escape the selector.

Let’s solve the first question first: how to find it?

#### Find the tailwindcss node

> Source code `postcss/mp` part

Each framework has different paths to their public style files. For example, the path of `uni-app` is `common/main.wxss`, and the path of `taro` is `app.wxss`. Some frameworks are even more bizarre, such as `common/miniprogram-app.wxss`, etc. This is simply simple.

So we can use the `appType` frame type passed in by the user to accurately locate the public style. However, this solution has undergone a lot of optimizations in the future. The core is to use `postcss` analysis to guess the file location where `tailwindcss` is located.

This guessed solution is implemented due to the characteristics of `tailwindcss`. Because `tailwindcss` will inject a large number of `css` variables before generating atomic classes to control the presentation of all atomic classes.

So we will see an `css` node like this

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

Then we can think that if we find it, this file is where the public style is located. However, when addressing, pay attention to the selector conditions and `-tw-` variable conditions to achieve an exact match.

#### Escape atomic class selector

> Source code `postcss/selectorParser` and `shared` parts

The first problem is solved, and the second problem comes one after another. How to change it?

Is it possible to directly escape all selectors? Obviously this is not feasible and will only lead to large-scale accidental damage to `css`.

We know that an `css` selector may be very simple or very complex. It can include adjacent sibling selectors, sub-selectors, descendant selectors, universal sibling selectors, pseudo-class selectors, pseudo-element selectors, and you can also use `,` to add selectors. We must further parse the selector to achieve exact matching and escaping.

At this time `postcss-selector-parser` needs to appear.

After we use `postcss` to perform `root.walk`, we then perform `css` on the `selectors.walk` nodes that meet the conditions, thereby achieving the effect of local and precise escaping of the selector.

In addition, since the default `tailwindcss` of `preflight` is for `h5`, we also need to inject our own applet `preflight`. Another point worth noting is that the escaping method of `js/wxml` is different from the escaping method of `wxss`, because `css` often adds an extra `\` character.

### Reimplementation of template parsing

> Source code `reg` and `wxml/utils` parts

The `wxml ast` originally used was a third-party one, and no one maintained it at all. There was always `bug` (for example, `wxml` inline with `wxs`), so I wrote a template attribute extractor based on regular rules.

This is due to the growing demand. Originally, it might be thought that it would be enough to support attribute escaping such as `class`/ `hover-class` in the template. However, it was later discovered that when users define and use components, they often pass `className` into the component as an attribute. At this time, we need to customize the generated regular rules to escape the attributes that meet the conditions. for example:

```html
<my-com class="bg-[#123456]" hover-class="bg-[#654321]" custom-class="text-[#ff00ff]" happy-attr="text-[green]" sad-attr="text-[blue]"></my-com>
```

By default, only the escaped `2` characters are matched. How can this be done? Therefore, the `customAttributesEntities` configuration item is opened. This configuration item will be matched with the original `class`/

### Dynamic source code patch

> Source code `tailwindcss` part

Many times, it is due to `tailwindcss`’s own limitations, technical national conditions and other reasons. Our `pr` is often not accepted by them. At this time, we need to modify their source code ourselves to encapsulate an `tailwindcss` that meets China's national conditions. This can be done by releasing a new version of `fork`, or by patching the source code.

> Note: When patching source code, this operation must be idempotent, otherwise repeated execution may destroy the structure of the source code.

#### Support custom length unit (rpx)

> Source code `tailwindcss/supportCustomUnit` part

Since `tailwindcss 3.2.x`, due to the addition of unit classification verification [issue#110](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/110), some atomic classes that originally wrote `rpx` directly in the class name were misidentified and then converted into colors.

What does it mean?

For example, there are three atomic classes now, `text-[#123]`, `text-[30rpx]`, and `text-[30px]`. Before `3.2.x`, the first one is the font color, and the next two are the font size. After this version, the first **2** are colors and only the last one is font size!

This is because `tailwindcss` will verify the legal length units on `mdn`. If it is in the legal length unit list, it is considered to be the font size, otherwise it is the font color. The unit `rpx` is unique to WeChat and is not a standard `css` unit. It is naturally outside the set of legal length units.

So how to do repair support? By reading the source code of `tailwindcss`, you will find that its method of verifying the unit is in the file `utils/dataType.js`.

Then use the `babel` three-piece set: `parse`, `traverse`,

## What's added in 2.0?

This version adds `WeappTailwindcss`
and `WeappTailwindcss` the Vite plugin.

They can automatically identify and accurately handle all `tailwindcss` tool classes, which means that it can handle both static and dynamic `wxss` in `wxml`, `js` and `class` (the v1 version only has the ability to handle `wxss`, So you no longer need to introduce and call the `wxml` method in `class`! Since the `js` plug-in has the ability to accurately convert `replaceJs`/`2.x`, the problem of accidental damage has been effectively solved, and the development experience of dynamic template frameworks such as `js` has been greatly improved.

Welcome to experience, `star`/`fork`.

## Epilogue

As Mark Twain famously said: `To a man with a hammer, everything looks like a nail`.

The author's plan will definitely have many limitations, and this article will inevitably have many errata.

Big guys are welcome to point it out, and everyone’s suggestions and guidance are welcome ^\_^

Author: [ice breaker](https://github.com/sonofmagic)

[weapp-link]: https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin
