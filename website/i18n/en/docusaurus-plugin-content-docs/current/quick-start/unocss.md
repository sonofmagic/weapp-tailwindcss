---
title: UnoCSS writing method compatible
description: Explain how to enable compatibility with some UnoCSS class writing methods in weapp-tailwindcss, as well as the current supported boundaries.
keywords:
  - weapp-tailwindcss
  - unocss
  - tailwindcss
  - Mini program
  - class
  - arbitrary values
  - Naked arbitrary value
  - Compatible with writing
  - Mini program escaping
  - bg-#fff
  - p-10%
  - text-rgb
---

# UnoCSS writing method compatible

`weapp-tailwindcss` still uses Tailwind CSS as the style generation engine. The `unocss` configuration is only compatible with some common UnoCSS class writing methods and is turned off by default.

## 1. Enablement method

```ts
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default {
  plugins: [
    WeappTailwindcss({
      unocss: true,
    }),
  ],
}
```

When turned on, it will do two things at the same time:

| Capabilities                     | Description                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Naked arbitrary value generation | Handle `p-10%`, `bg-#fff`, `text-rgb(255,0,0)` and other candidates to Tailwind CSS v4 runtime generation link processing.        |
| class name escape                | Continue to use the existing `weapp-tailwindcss` escape link of `customReplaceDictionary`. For example, by default, `:`, `[`, and |

> Note: JS translation still follows the `classNameSet` precise hit principle and will not make heuristic guesses for ordinary strings.

## 2. Supported writing methods

After turning on `unocss: true`, Tailwind CSS v4 generated links can recognize the following writing methods:

| Type                      | Example                                                                           |
| ------------------------- | --------------------------------------------------------------------------------- |
| Size and Spacing          | `p-10%`, `p-2.5px`, `m-4rem`, `w-100px`, `h-50vh`,                                |
| Color                     | `bg-#fff`, `text-#f00`, `border-#123456`, `from-#123`,                            |
| Function value            | `text-rgb(255,0,0)`, `bg-rgba(0,0,0,0.5)`, `w-calc(100%-1rem)`, `bg-var(--brand)` |
| Some variant combinations | `hover:!-mt-2rem`, `dark:bg-#000`, `group-hover:bg-#fff`                          |

The arbitrary value writing methods originally supported by Tailwind are still available:

```html
<view class="w-[10%] bg-[#fff] text-[rgb(255,0,0)]"></view>
```

## 3. Currently unsupported writing method

The `unocss` configuration is not a UnoCSS engine and will not load the UnoCSS preset. The following writing methods are not currently compatible:

| Writing method   | Reason                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------- |
| `i-carbon-add`   | This is UnoCSS Icons preset syntax, Tailwind CSS will not generate corresponding icon rules. |
| `~mt-2/4`        | This is the UnoCSS/Windi shortcut style and will not be expanded currently.                  |
| `bg-$color`      | This variable abbreviation is not currently supported.                                       |
| `sm:-top-1.5rem` | The applet target filters out unsupported reactive variants.                                 |

## 4. Custom escape rules

When you need to customize class character replacements such as `:`, `[`, `#`, etc., use `customReplaceDictionary`:

```ts
WeappTailwindcss({
  unocss: true,
  customReplaceDictionary: {
    ':': '-c-',
  },
})
```

This ensures that class escape has only one configuration entry: `customReplaceDictionary`.
