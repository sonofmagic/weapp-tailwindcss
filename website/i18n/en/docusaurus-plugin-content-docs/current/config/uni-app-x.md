---
title: uni-app x Configuration Reference
description: Configuration options, defaults, and cross-platform boundaries for uni-app x, HBuilderX, and weapp-tailwindcss.
keywords:
  - uni-app x
  - HBuilderX
  - uniAppX
  - Tailwind CSS 4
  - configuration
  - Vite
  - uvue
  - unit conversion
---

# uni-app x Configuration Reference

This page documents the `uniAppX()` preset. For the setup flow, see the [uni-app x quick start](../quick-start/frameworks/uni-app-x).

## Support baseline

- `weapp-tailwindcss` `5.3.3`
- Tailwind CSS `4.x`
- Node.js `^22.18.0 || >=24.11.0`
- HBuilderX `>=5.11`
- HBuilderX Web, mini-program, Android, iOS, and HarmonyOS targets

## Install

```bash npm2yarn
npm install -D tailwindcss weapp-tailwindcss
```

For a HBuilderX-managed uni-app x project, install dependencies in the project root. Do not register `@tailwindcss/vite` or `@tailwindcss/postcss` in the same build.

## Minimal configuration

```ts title="vite.config.ts"
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss(uniAppX({
      base: projectRoot,
      cssEntries: [resolve(projectRoot, 'main.css')],
    })),
  ],
})
```

`cssEntries` tells the generator which Tailwind entry to use. The CSS still has to be imported by `App.uvue` or another real application entry. Do not register `@tailwindcss/postcss` or `@tailwindcss/vite` in the same build.

## `uniAppX()` options

| Option                 | Type                            | Default                | Description                                                                                                       |
| ---------------------- | ------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `base`                 | `string`                        | Required               | Project root. Derive it from the config file URL so HBuilderX working-directory changes do not affect resolution. |
| `cssEntries`           | `string[]`                      | Auto-detected          | Tailwind CSS 4 entries. List every entry for multi-entry or split-style builds; absolute paths are recommended.   |
| `rem2rpx`              | `boolean \| object`             | —                      | Convert `rem` to `rpx`; this is a top-level preset option.                                                        |
| `unitsToPx`            | `boolean \| object`             | —                      | Configure length-unit conversion to `px`.                                                                         |
| `unitConversion`       | `object \| false`               | —                      | Configure shared or platform-specific CSS unit conversion.                                                        |
| `generator`            | `object \| false`               | Inferred               | Tailwind generator settings. Web/H5 automatically uses `target: 'web'` and Web compatibility handling.            |
| `uniAppX`              | `boolean \| object`             | Enabled for native App | Controls uvue/App handling, local styles, and unsupported utilities.                                              |
| `componentLocalStyles` | `boolean \| object`             | `true`                 | Shortcut for `uniAppX.componentLocalStyles`.                                                                      |
| `uvueUnsupported`      | `'error' \| 'warn' \| 'silent'` | `'warn'`               | Controls handling of unsupported uvue utilities.                                                                  |
| `customAttributes`     | `ICustomAttributes`             | —                      | Adds class-name transformation rules for template attributes beyond `class`.                                      |
| `resolve`              | `PackageResolvingOptions`       | Project `node_modules` | Adds custom Tailwind package resolution paths.                                                                    |
| `rawOptions`           | `UserDefinedOptions`            | —                      | Passes through core options not covered by preset shortcuts.                                                      |

`rem2rpx`, `unitsToPx`, and `unitConversion` belong at the preset top level, not under `cssOptions`.

## Local styles and uvue compatibility

```ts
uniAppX({
  base: projectRoot,
  cssEntries: [resolve(projectRoot, 'main.css')],
  componentLocalStyles: {
    enabled: true,
    onlyWhenStyleIsolationVersion2: false,
    componentMatcher: id => /(?:^|\/)layouts\/.+\.uvue$/.test(id),
    pageMatcher: id => /(?:^|\/)pages\/.+\.uvue$/.test(id),
  },
  uvueUnsupported: 'warn',
})
```

- `componentMatcher` and `pageMatcher` receive module paths with query/hash removed and slash separators normalized.
- A matcher replaces the default `components` or `pages` rule. Include both paths in the callback when the default directories should remain enabled.
- `onlyWhenStyleIsolationVersion2` defaults to `true`; local component styles are enabled only when `manifest.json` uses style isolation version 2.
- Use `'error'` in CI when unsupported utilities must fail the build; use `'silent'` only for known, intentionally ignored cases.

## Tailwind entry

```css title="main.css"
@import "tailwindcss" source(none);

@source "./App.uvue";
@source "./pages/**/*.{uvue,uts}";
@source "./components/**/*.{uvue,uts}";
@source not "./uni_modules/**/*";
@source not "./unpackage/**/*";
```

Import it in the global `App.uvue` style block:

```html
<style>
@import './main.css';
</style>
```

## Cross-platform boundaries

- Native uni-app x App targets do not need `generator.target: 'app'`; `uniAppX`, platform environment, and unit conversion handle native differences.
- Do not disable `uniAppX` for Web/H5. `.uvue` arbitrary values and dark utilities still need the uni-app x transformation path.
- `cssEntries` does not replace a real import in the build graph. Without that import, CSS can be generated but never loaded by the page.
- Do not scan `unpackage`, `dist`, or all of `uni_modules` without an explicit reason.
- `gap`, `space-x-*`, and `space-y-*` are not portable native uvue layout primitives; use child margins or a target-specific layout component.

## Validation

Run the corresponding development or build flow in your own HBuilderX project, then verify:

- Web, mini-program, Android, iOS, and HarmonyOS produce the real target artifacts with the expected CSS suffixes and entry files.
- `cssEntries` points to an entry actually imported by the project, and the scan range covers pages, components, and layouts.
- Unit conversion, `componentLocalStyles`, `uvueUnsupported`, and `customAttributes` match each target's limitations.
- HBuilderX, simulators, or devices show the same result as the build artifacts; an H5 build alone is not evidence for native App support.
