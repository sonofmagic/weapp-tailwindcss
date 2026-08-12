# @weapp-tailwindcss/lynx

[简体中文](./README.md) | English

Tailwind CSS 4 integration for ReactLynx and Rspeedy. It invokes `weapp-tailwindcss` through Rspeedy's Rspack lifecycle to produce standard CSS for Lynx, preserves native ReactLynx `className`, and introduces no runtime stylesheet or JSX transform.

## Install

```bash
pnpm add @weapp-tailwindcss/lynx tailwindcss
```

## Configure

```ts
import { defineConfig } from '@lynx-js/rspeedy'
import { pluginLynxTailwindcss } from '@weapp-tailwindcss/lynx'

export default defineConfig({
  plugins: [pluginLynxTailwindcss()],
})
```

Import Tailwind CSS 4 from the application CSS entry and point `@source` at the actual source files. Lynx does not need browser preflight, so importing only theme and utilities avoids most compatibility warnings:

```css
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities) source(none);

@source "./**/*.{ts,tsx}";
```

`pluginLynxTailwindcss` fixes `platform` to `'lynx'`, sets `generator.target` to `'web'`, and enables Lynx-compatible output. Tailwind CSS 4 theme variables are resolved at build time, while application-defined dynamic variables remain unchanged.

The initial release supports ReactLynx + Rspeedy and Tailwind CSS 4 only. It does not cover Rspeedy Web output, non-React Lynx frameworks, Tailwind CSS 3, or React Native-style runtime style mapping.

## Arbitrary values

Lynx keeps the original `className`; class names are not escaped as they are for mini app targets. Arbitrary values must appear as complete static strings in files covered by `@source`:

```tsx
<view className="h-[45rpx] w-[123px] rounded-[18px] bg-[#123456] p-[13px]" />
```

Do not construct arbitrary values at runtime. Enumerate complete class names or register candidates explicitly:

```css
@source inline("w-[120px] w-[240px] bg-[#123456]");
```

Tailwind generating CSS does not guarantee support from Lynx's native CSS parser. The current encoder removes unsupported properties such as `padding-inline` and `mask-type`, as well as complex selectors containing `:is()` or `:where()`. Use physical-direction utilities such as `pl-*` and `pr-*` when needed, and validate pseudo-elements, interaction states, media queries, and visual effects on the target runtime.

Using the full `@import "tailwindcss"` also includes browser preflight. Prefer the theme and utilities entry above when Rspeedy reports unsupported browser selectors.

## Validate

```bash
pnpm --filter @weapp-tailwindcss/lynx test
pnpm e2e:lynx
```

For repository-level visual validation with iOS Simulator and LynxExplorer:

```bash
pnpm e2e:lynx:ios
```

The visual command starts Rspeedy, resolves the actual bundle URL, captures a screenshot, and checks generated colors. The current LynxExplorer iOS build requires manually pasting the URL and selecting Go when prompted.
