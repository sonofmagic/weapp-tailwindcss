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

```css title="Declarations before static evaluation"
.w-32 { width: calc(var(--spacing) * 32); }
.p-4 { padding: calc(var(--spacing) * 4); }
```

See [Issue #1214](https://github.com/sonofmagic/weapp-tailwindcss/issues/1214) for reproductions, environments, and fix progress. This page distinguishes WeChat runtime limitations from the library build-pipeline fix. After the fixed patch is released, still inspect the actual output for the version you use.

## Current build fix

The current fix preserves variable declarations and their scopes throughout Tailwind CSS 4 mini-program deferred and incremental generation. When a build-time fixed variable is explicitly selected with `cssOptions.cssCalc: ['--spacing']`, the build pipeline checks whether static evaluation is safe using the complete context, then computes the final length:

```css title="Declarations after static evaluation"
.w-32 { width: 32rpx; }
.p-4 { padding: 4rpx; }
```

This fixes context propagation, scope analysis, and cache invalidation in the library, avoiding WeChat's intermediate runtime multiplication of a small `rpx` base. Known local selector overrides, conditional declarations, or conflicting source values within a shared style scope keep the affected variables and their dependency chains as runtime expressions. Theme or configuration changes cause affected rules to be recalculated during incremental generation.

Vite builds preserve expressions until the final CSS asset graph is available. Entry points, static imports, and CSS imports determine shared style scopes; static evaluation then runs before unit conversion. Separate output files are not automatically isolated: styles loaded together participate in the same analysis, while independent entry scopes are evaluated separately. The Vite development server and styles embedded in native App code do not use this deferred stage.

Static analysis cannot predict future JavaScript or inline-style changes. Select only variables that will remain fixed at runtime. Disabled or unconfigured `cssCalc`, unresolved variables, and later plugins that recreate expressions can still leave runtime `calc()`. This does not change WeChat's own conversion algorithm.

## Build-time advisory warning

:::warning Advisory diagnosis, not a build failure
When the generation target is `weapp` and configuration or framework environment identifies WeChat, the plugin inspects Tailwind CSS 4 `@theme` / `@theme inline` inputs. Custom properties containing an `rpx` value trigger a `[tailwindcss@4][rpx-theme]` warning. This includes `--spacing`, `--gap`, `--padding`, and even, negative, or fractional bases. Custom properties in ordinary style rules are outside this diagnosis.

H5, ordinary Web, other mini programs, and builds with an unknown platform do not warn. The generic `weapp` output target alone does not identify WeChat. Diagnosis uses source and entry dependency information already available to generation; it does not scan arbitrary application CSS just to produce a warning.

Each build session (`runtimeState`) emits at most one warning. Subsequent watch/HMR generations do not repeat it; a new session can warn again. Existing `logLevel` controls apply: `'warn'` retains it, while `'silent'` or `'error'` suppresses it. No new configuration is needed. Diagnosis does not change CSS, the class set, or the exit status.
:::

The message also reports the CSS state after the shared generation pipeline. This sample can precede static evaluation of Vite's final assets:

| Result                                                                     | Meaning                                                                                                                           |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| An `rpx` theme variable was found                                          | A configuration compatibility advisory, not proof of incorrect dimensions                                                         |
| A related `calc(var(--name) * ...)` or an inline `rpx` calculation remains at the current generation stage | Later build processing may make it static; this does not prove final WXSS retains runtime arithmetic, or that an inline expression came from the theme variable |
| No related `calc` was detected at the current generation stage              | This stage may be static or may not use the variable; it does not verify final assets, every scope, or every device                |
| Output diagnosis could not complete                                        | Output analysis is skipped without failing the build or claiming safety                                                           |

Even when `cssCalc` successfully makes final WXSS static, an earlier warning may still report expressions at the generation stage; inspect final WXSS to determine the result. `@theme inline` alone usually substitutes the literal and may leave `calc(3rpx * 8)`, which is not static `24rpx`. An unparseable source is skipped. One warning is not a complete inventory of every build artifact. Later minification or custom plugins may still change CSS; inspect final WXSS and verify on target devices.

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

- **Precomputation needs fixed variable context.** The pipeline retains the effective Tailwind v4 theme and complete raw declarations, then checks fixed variables within shared style scopes; Vite builds defer evaluation until the final CSS asset stage. With `--spacing: 1rpx` and `cssCalc: ['--spacing']`, the output can contain final lengths such as `32rpx`. Known dynamic overrides, source conflicts, unresolved variables, and unselected variables remain expressions; a `var()` fallback alone does not make an unknown variable constant.
- **Preserving the original declaration is a separate choice.** `cssCalc: true` and array options replace resolvable calculations by default. Object options with `preserve: true` retain the original declaration, which may override the static result. `cssCalc` no longer implicitly enables global variable expansion through `cssPresetEnv`. If you explicitly enable that independent feature, verify its output and dynamic-theme behavior separately.
- **Unit conversion does not imply precomputation.** Enabling `rem2rpx` or `px2rpx`, or finding an `rpx` variable in the output, does not by itself establish that runtime `calc` has been removed.

Inspect the final utility property value and any later declaration that could override it. Finding `--spacing: 1rpx` and the class name in WXSS is not enough.

## @theme inline does not automatically remove calc

Using only `@theme inline { --spacing: 1rpx; }` can still produce `calc(1rpx * 32)`. The native WXSS control confirmed a size difference with this expression too.

Combining `@theme inline` with `cssCalc: ['--spacing']` uses the same static evaluation path when the variable is resolvable at build time. `@theme inline` alone can still leave `calc(1rpx * 32)`; do not use static evaluation when the theme value changes at runtime. Inspect the output and test the target device before relying on it.

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
