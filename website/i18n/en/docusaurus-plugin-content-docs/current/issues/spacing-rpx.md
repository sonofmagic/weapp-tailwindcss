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

## Default automatic adaptation

Current source adds `cssCalc: 'auto'`. When Tailwind CSS 4 and a WeChat target are explicitly identified, an omitted option selects this mode. Vite WeChat builds resolve fixed rpx themes within the complete output CSS scope, producing `width: 32rpx` from `--spacing: 1rpx` and `w-32` without extra configuration.

This changes the 5.5.10 default, which still retains runtime calc. Verify that the installed release includes this change and inspect its final WXSS.

Automatic mode only replaces calc expressions that fully reduce to an rpx length, including safe aliases and inline literals. It leaves plain var references and unrelated units unchanged. Explicit booleans, variable lists and option objects keep their existing meaning; nested `cssOptions.cssCalc` takes precedence.

**The default does not make both rpx and px spacing static.** The following table uses ordinary `@theme` declarations, Tailwind CSS 4 targeting WeChat, and a complete Vite style context without known overrides. No additional unit conversions or custom plugin rewrites are enabled. Formatting differences are omitted:

| Theme configuration        | `cssOptions.cssCalc` | `mt-2`                                 | `gap-2`                         |
| -------------------------- | -------------------- | -------------------------------------- | ------------------------------- |
| `--spacing: 1rpx`          | Omitted or `'auto'`  | `margin-top: 2rpx`                     | `gap: 2rpx`                     |
| `--spacing: 1px`           | Omitted or `'auto'`  | `margin-top: calc(var(--spacing) * 2)` | `gap: calc(var(--spacing) * 2)` |
| `--spacing: 1px`           | `true`               | `margin-top: 2px`                      | `gap: 2px`                      |
| `--spacing: 1rpx` or `1px` | `false`              | `margin-top: calc(var(--spacing) * 2)` | `gap: calc(var(--spacing) * 2)` |

`true` can also evaluate other eligible units. `false` disables this plugin's calculation; it does not stop other plugins from expanding variables or rewriting expressions. Local or conditional overrides and incomplete context also preserve rpx variable expressions. See the dynamic variable examples below for runtime updates.

Vite evaluates after author plugins and before unit conversion. Mini-program hosts can load page or component styles together without CSS import edges, so automatic mode conservatively includes every CSS asset in the current bundle. Conflicting values prevent automatic evaluation even when those assets are actually isolated. Explicit configuration keeps its existing entry and import scopes. Local or conditional overrides, conflicting sources, unresolved or cyclic dependencies and property registrations prevent variable evaluation. Missing imported assets make the scope incomplete. Adapters without complete scope metadata only simplify literals. Watch changes restore original expressions before reassessing safety.

:::warning Opt out for runtime themes
Automatic mode treats statically eligible rpx themes as fixed. Future JavaScript and inline-style updates cannot be predicted; a generated `width: 32rpx` will no longer respond to changes of `--spacing`. Use:

```ts
WeappTailwindcss({
  cssOptions: { cssCalc: false },
})
```

Opting out preserves runtime references and their WeChat rpx calc limitations. Applications can supply final rpx lengths themselves. This feature does not change WeChat's conversion algorithm. Web, native App, other mini-program platforms and unknown targets are not enabled by default.
:::

## Build-time advisory warning

:::warning Advisory diagnosis, not a build failure
When the generation target is `weapp` and configuration or framework environment identifies WeChat, the plugin inspects Tailwind CSS 4 `@theme` / `@theme inline` inputs. Custom properties containing an `rpx` value trigger a `[tailwindcss@4][rpx-theme]` warning. This includes `--spacing`, `--gap`, `--padding`, and even, negative, or fractional bases. Custom properties in ordinary style rules are outside this diagnosis.

H5, ordinary Web, other mini programs, and builds with an unknown platform do not warn. The generic `weapp` output target alone does not identify WeChat. Diagnosis uses source and entry dependency information already available to generation; it does not scan arbitrary application CSS just to produce a warning.

Each build session (`runtimeState`) emits at most one warning. Subsequent watch/HMR generations do not repeat it; a new session can warn again. Existing `logLevel` controls apply: `'warn'` retains it, while `'silent'` or `'error'` suppresses it. No new configuration is needed. Diagnosis does not change CSS, the class set, or the exit status.
:::

The message also reports the CSS state after the shared generation pipeline. This sample can precede static evaluation of Vite's final assets:

| Result                                                                                                     | Meaning                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An `rpx` theme variable was found                                                                          | A configuration compatibility advisory, not proof of incorrect dimensions                                                                                       |
| A related `calc(var(--name) * ...)` or an inline `rpx` calculation remains at the current generation stage | Later build processing may make it static; this does not prove final WXSS retains runtime arithmetic, or that an inline expression came from the theme variable |
| No related `calc` was detected at the current generation stage                                             | This stage may be static or may not use the variable; it does not verify final assets, every scope, or every device                                             |
| Output diagnosis could not complete                                                                        | Output analysis is skipped without failing the build or claiming safety                                                                                         |

Even when `cssCalc` successfully makes final WXSS static, an earlier warning may still report expressions at the generation stage; inspect final WXSS to determine the result. With automatic calculation disabled or the target unmatched, `@theme inline` only substitutes the literal and may leave `calc(3rpx * 8)`. Active automatic mode reduces this literal to `24rpx`. An unparseable source is skipped. One warning is not a complete inventory of every build artifact. Later minification or custom plugins may still change CSS; inspect final WXSS and verify on target devices.

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

On WeChat v4, the default is now `'auto'`; on other targets it remains disabled. To precompute fixed theme values, select the variables explicitly:

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

## @theme inline and automatic mode

WeChat v4 automatic mode reduces literal expressions such as `calc(1rpx * 32)` to `32rpx`. With calculation explicitly disabled, inline alone still leaves runtime multiplication and its sizing limitation. Explicit variable-list configuration continues to work. Inline themes do not preserve runtime variable references.

## Choosing between fixed sizes and runtime themes

For fixed sizes that need accurate `calc` arithmetic, prefer `px` or a final length computed at build time. If you must retain an `rpx` base, consider larger or even values first, but any improvement depends on the device conversion ratio and requires testing on target devices. Even `rpx` values are not a guarantee. To avoid intermediate rpx conversion, write the final length directly:

```html
<view style="width: 32rpx; padding: 4rpx"></view>
```

You can also use arbitrary values such as `w-[32rpx]` and `p-[4rpx]`, checking that the final WXSS contains the corresponding direct lengths. For example, fixed pixel spacing can use `@theme { --spacing: 1px; }`; check that the final WXSS retains `px` rather than converting it back through `px2rpx`. This changes the design to a fixed pixel scale instead of scaling with the window width as `rpx` does. Do not preconvert rpx to px using one device's ratio or add empirical correction factors.

If pages, components, or theme switches override `--spacing` at runtime, precomputation changes that behavior: a generated `width: 32rpx` no longer responds to `--spacing` updates. Inlining a fixed value through `@theme inline` also removes the runtime reference to that variable. Apply this strategy only to variables fixed at build time. For dynamic sizes, consider calculating the final length at runtime and updating the style instead of multiplying a very small rpx base in WXSS.

### Update px spacing dynamically

This uni-app Vue example updates an ordinary `@theme` variable through inline styles. Automatic mode itself does not freeze px variables. The explicit `cssCalc: false` keeps runtime calculations, while `px2rpx: false` retains fixed pixel units. Do not add other unit conversion rules that turn these px values back into rpx.

```ts title="Plugin options in vite.config.ts"
WeappTailwindcss({
  cssEntries: ['./src/tailwind.css'],
  cssOptions: {
    cssCalc: false,
    px2rpx: false,
  },
})
```

```css title="src/tailwind.css"
@import 'tailwindcss';

@theme {
  --spacing: 4px;
}
```

```vue title="Page component"
<script setup lang="ts">
import { ref } from 'vue'

const spacing = ref(4)
</script>

<template>
  <view :style="{ '--spacing': `${spacing}px` }">
    <view class="mt-2 flex gap-2">
      <view>A</view>
      <view>B</view>
    </view>
    <button @click="spacing = spacing === 4 ? 8 : 4">
      Toggle spacing
    </button>
  </view>
</template>
```

`mt-2` and `gap-2` retain their references to `--spacing`. Switching the base from `4px` to `8px` changes both lengths from `8px` to `16px`. The variable applies to the styled node and descendants that inherit it. Use ordinary `@theme`, not `@theme inline` with a fixed value: changing `--spacing` at runtime cannot update values already inlined into utilities.

### Provide final rpx lengths dynamically

For sizes that scale with the window width, keep the plugin configuration and Tailwind entry above, calculate the final rpx lengths in JS, and reference the resulting CSS variables directly:

```vue title="Page component"
<script setup lang="ts">
import { ref } from 'vue'

const spacing = ref(1)
</script>

<template>
  <view>
    <view
      class="w-[var(--box-width)] p-[var(--box-padding)]"
      :style="{
        '--box-width': `${spacing * 32}rpx`,
        '--box-padding': `${spacing * 4}rpx`,
      }"
    >
      Dynamic sizes
    </view>
    <button @click="spacing = spacing === 1 ? 3 : 1">
      Toggle sizes
    </button>
  </view>
</template>
```

The utilities use `width: var(--box-width)` and `padding: var(--box-padding)` directly. With a base of `1`, the variables hold `32rpx` and `4rpx`; switching to `3` produces `96rpx` and `12rpx`. WeChat converts only the final lengths, without multiplying a small rpx base in CSS. Setting `cssCalc: false` alone while retaining `calc(var(--spacing) * N)` can still expose WeChat's runtime rpx calculation differences.

## Validation scope

- Inspect final WXSS and rendered sizes. Compare `calc(1rpx * 8)`, `calc(1 * 8rpx)`, `calc(8 * 1rpx)`, and direct `8rpx`; include `3rpx`, even, fractional, and negative values.
- Change the theme value and verify both development and production builds to check for stale precomputed values.
- Record window width, DPR, base library, and rendering backend. Independent runtime evidence currently covers the DevTools environment above, not Android/iOS devices or Skyline. Do not generalize these results to H5 or other mini program platforms.

See [CSS variable calculation mode](../multi-platform.md#css-variable-calculation-mode) for configuration details.
