---
title: WeChat --spacing and rpx calculation limits
description: Understand WeChat calc size differences with Tailwind CSS 4 rpx spacing, cssCalc limitations, and the tradeoff with runtime theme updates.
keywords:
  - weapp-tailwindcss
  - Tailwind CSS 4
  - WeChat mini programs
  - spacing
  - rpx
  - calc
  - cssCalc
  - CSS variables
---

# WeChat --spacing and rpx calculation limits

Tailwind CSS 4 accepts `--spacing: 1rpx` inside `@theme`. However, valid generated WXSS does not guarantee the same rendered size as a direct `rpx` length in WeChat mini programs. Utilities for dimensions, padding, and margins can retain runtime multiplication:

```css
@theme {
  --spacing: 1rpx;
}
```

```css title="Example generated declarations"
.w-32 { width: calc(var(--spacing) * 32); }
.p-4 { padding: calc(var(--spacing) * 4); }
```

See [Issue #1214](https://github.com/sonofmagic/weapp-tailwindcss/issues/1214) for reproductions, environments, and fix progress. This page distinguishes WeChat runtime limitations from the build issue confirmed with `weapp-tailwindcss@5.5.6`. Check the actual output when using other versions.

## rpx conversion can amplify errors in the base length

In a native WXSS control without Tailwind, `calc(1rpx * 32)` measured `32px`, while direct `32rpx` measured `16px`. This control used WeChat DevTools `2.02.2608070`, base library `3.17.3`, simulator window width `390`, and DPR `3`.

Additional native WXSS measurements in the same DevTools environment covered different bases and unit placement:

| Expression       | Measured width |
| ---------------- | -------------- |
| `calc(1rpx * 8)` | `8px`          |
| `calc(3rpx * 8)` | `8px`          |
| `calc(2rpx * 8)` | `8px`          |
| `calc(1 * 8rpx)` | `4px`          |
| `calc(8 * 1rpx)` | `8px`          |
| Direct `8rpx`    | `4px`          |
| Direct `16rpx`   | `8px`          |
| Direct `24rpx`   | `12px`         |
| Direct `4px`     | `4px`          |
| Direct `8px`     | `8px`          |

The earlier user report of `calc(1rpx * 8) = 8px` and `calc(1 * 8rpx) = 4px` has now been independently reproduced in this environment, with `3rpx` added. These results support an explanation in which the operand carrying the unit is converted or quantized before multiplication, amplifying its error. At a window width of 390, the theoretical ratio gives approximately `0.52px` per `rpx`; this does not establish that WeChat internally converts to `0.5px` and then rounds to `1px`. The exact algorithm and rounding stage remain unconfirmed. The pixel values in this table are not a fixed conversion ratio for all devices.

`calc(3rpx * 8)` measured `8px`, while direct `24rpx` measured `12px`, showing that a direct final length avoids this intermediate discrepancy. Even bases are not guaranteed to avoid it: in the earlier native control, `calc(2rpx * 32)` and direct `64rpx` measured `32px` and `33px`, respectively.

`calc(1 * 8rpx)` changes the numeric value carrying the unit; it does more than swap the operand order. These results do not establish that `calc(8 * 1rpx)` fixes the problem.

## cssCalc capabilities and known limitations

`cssOptions.cssCalc` is disabled by default. To precompute fixed theme values, select the variables explicitly:

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: ['--spacing'],
  },
})
```

The intended result is to reduce a known `calc(1rpx * 32)` to `32rpx`, so WeChat converts only the final length. Keep these limitations in mind:

- **Precomputation needs variable values.** In the `5.5.6` uni-app WeChat reproduction, both top-level and nested `cssCalc: ['--spacing']` still produced `calc(var(--spacing)*32)`. The deferred mini program pipeline rewrites theme selectors before evaluation without passing the variable values to the final evaluator. The evaluator supports `rpx`, but enabling the option alone does not guarantee static output on this path.
- **The original declaration can override a static fallback.** `cssCalc: true` can retain a later `var()` / `calc()` declaration. When WeChat accepts that expression, it can override the static value even if the calculated size differs. The array form cleans up matching original declarations after successful precomputation; unresolved declarations cannot be assumed to have been replaced.
- **Unit conversion does not imply precomputation.** Enabling `rem2rpx` or `px2rpx`, or finding an `rpx` variable in the output, does not by itself establish that runtime `calc` has been removed.

Inspect the final utility property value and any later declaration that could override it. Finding `--spacing: 1rpx` and the class name in WXSS is not enough.

## @theme inline does not automatically remove calc

Using only `@theme inline { --spacing: 1rpx; }` can still produce `calc(1rpx * 32)`. The native WXSS control confirmed a size difference with this expression too.

Combining `@theme inline` with `cssCalc: ['--spacing']` produced `32rpx` in memory checks of the published `5.5.6` generator and deferred processing path. This combination has not been verified through a full uni-app build and device run. It is not a confirmed general fix; inspect the output and test the target device before relying on it.

## Choosing between fixed sizes and runtime themes

For fixed sizes that need accurate `calc` arithmetic, prefer `px` or a final length computed at build time. If you must retain an `rpx` base, consider larger or even values first, but any improvement depends on the device conversion ratio and requires testing on target devices. Even `rpx` values are not a guarantee. To avoid intermediate rpx conversion, write the final length directly:

```html
<view style="width: 32rpx; padding: 4rpx"></view>
```

You can also use arbitrary values such as `w-[32rpx]` and `p-[4rpx]`, checking that the final WXSS contains the corresponding direct lengths. For example, fixed pixel spacing can use `@theme { --spacing: 1px; }`; check that the final WXSS retains `px` rather than converting it back through `px2rpx`. This changes the design to a fixed pixel scale instead of scaling with the window width as `rpx` does. Do not preconvert rpx to px using one device's ratio or add empirical correction factors.

If pages, components, or theme switches override `--spacing` at runtime, precomputation changes that behavior: a generated `width: 32rpx` no longer responds to `--spacing` updates. Inlining a fixed value through `@theme inline` also removes the runtime reference to that variable. Apply this strategy only to variables fixed at build time. For dynamic sizes, consider calculating the final length at runtime and updating the style instead of multiplying a very small rpx base in WXSS.

## Validation scope

- Inspect final WXSS and rendered sizes. Compare `calc(1rpx * 8)`, `calc(1 * 8rpx)`, `calc(8 * 1rpx)`, and direct `8rpx`; include `3rpx`, even, fractional, and negative values.
- Change the theme value and verify both development and production builds to check for stale precomputed values.
- Record window width, DPR, base library, and rendering backend. Independent runtime evidence currently covers the DevTools environment above, not Android/iOS devices or Skyline. Do not generalize these results to H5 or other mini program platforms.

See [CSS variable calculation mode](../multi-platform.md#css-variable-calculation-mode) for configuration details.
