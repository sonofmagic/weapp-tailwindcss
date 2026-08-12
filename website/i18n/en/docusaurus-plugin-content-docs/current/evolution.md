---
title: technological evolution
description: Weapp-tailwindcss core processing link after evolving from patch solution to v5 generation mode.
keywords:
  - technological evolution
  - evolution
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

#technologicalevolution

The core change in `weapp-tailwindcss@5` is that Tailwind CSS generation is completed at build runtime, and business projects are no longer required to execute `weapp-tw patch`. After the builder gets the class name collection produced by Tailwind, it then performs small program target translation on templates, scripts and styles.

Current main processing links:

- Tailwind CSS 4: `weapp-tailwindcss`’s generator entry takes over CSS generation
- Template: Use `htmlparser2` to parse `wxml` / HTML-like template
- Script: Use Babel to parse the syntax, and then rewrite the class name through precise position replacement
- Styling: Use PostCSS to handle selectors, units, CSS variables, and platform compatibility logic
- HMR: The watch scene will re-collect the class name collection, and continue to participate in generation and translation after adding any value class name

## wxml

Using `htmlparser2` is the choice for `v2` to start to stabilize in the later stages.

`@vivaxy/wxml` was used earlier. It is an `wxml` AST tool, but its maintenance has been stagnant for a long time, and it is prone to errors when encountering inline `wxs`.

Later, I tried regular processing, but it was difficult for regular expressions to correctly handle conditional expressions, for example:

`<view class="{{2>1?'xxx':'yyy'}}"></view>`

`2>1` here will interfere with simple tag matching. Template translation requires parsing the structure and cannot just rely on string interception.

`parse5` is closer to HTML5 rules and not loose enough for mini program templates. `htmlparser2` is ultimately reserved for handling such templates.

## babel

Script handling has also undergone a major overhaul. Early links are:

`@babel/parser`->`@babel/traverse`->`@babel/generator`

This approach is equivalent to regenerating the user script, which is easy to change the format and will also affect the sourcemap.

Now it's `@babel/parser` -> `@babel/traverse` -> `magic-string#replace`. Babel is responsible for positioning, `magic-string` only replaces the hit fragment.

JS translation is also subject to `classNameSet` constraints: only class names that have been generated or compatible with Tailwind will be escaped to avoid accidentally changing ordinary strings into applet class names.

## postcss

Style processing is still based on PostCSS. It takes care of selector escaping, length unit handling, CSS variable compatibility, preflight compatibility, and platform target differences.

After v5, PostCSS is no longer equivalent to "registering the Tailwind plug-in in the business project". For builder access methods such as Vite, Webpack, and Gulp, the generation of Tailwind CSS is taken over by `weapp-tailwindcss` itself; business projects do not need to additionally register `tailwindcss`, `@tailwindcss/postcss`, or `@tailwindcss/vite` to generate mini program target CSS.
