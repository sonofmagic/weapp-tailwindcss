---
title: React Native / Expo Configuration Reference
description: Tailwind CSS 4 configuration options and manifest behavior for React Native, Expo, Metro, and @weapp-tailwindcss/react-native.
keywords:
  - React Native
  - Expo
  - Metro
  - Babel
  - React Native manifest
  - Tailwind CSS 4
  - configuration
  - React Native styles
  - manifest warnings
  - platform variants
---

# React Native / Expo Configuration Reference

This page documents the Metro, Babel, and manifest configuration for `@weapp-tailwindcss/react-native`. For the setup flow, see the [React Native / Expo quick start](../quick-start/react-native-expo).

## Support baseline

- `@weapp-tailwindcss/react-native` `0.2.5`
- Expo `>=54`
- React `>=19`
- React Native `>=0.81`
- Tailwind CSS `4.x`
- Node.js `>=22.12.0`

The package generates a React Native style manifest. It does not emit Web CSS or mini-program WXSS and does not add NativeWind or a `react-native-css` runtime.

## Install

```bash
pnpm add @weapp-tailwindcss/react-native
pnpm add -D tailwindcss
```

Expo projects also need Expo SDK, React, and React Native. Non-Expo projects should keep their existing Metro, Babel, and React Native dependencies.

## Metro configuration

```js title="metro.config.js"
const { getDefaultConfig } = require('expo/metro-config')
const { withWeappTailwindcss } = require('@weapp-tailwindcss/react-native/metro')

const config = getDefaultConfig(__dirname)

module.exports = withWeappTailwindcss(config, {
  input: './global.css',
  sourceGlobs: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
})
```

| Option        | Type                  | Default         | Description                                                                                              |
| ------------- | --------------------- | --------------- | -------------------------------------------------------------------------------------------------------- |
| `projectRoot` | `string`              | `process.cwd()` | App root. Metro resolves the React and React Native singletons from this path.                           |
| `input`       | `string`              | —               | Tailwind CSS entry, resolved relative to `projectRoot`; enables source scanning and manifest generation. |
| `css`         | `string`              | `''`            | Raw CSS input for tests or projects without a CSS file.                                                  |
| `manifest`    | `NativeStyleManifest` | —               | Uses an existing manifest and skips CSS generation.                                                      |
| `classSet`    | `Iterable<string>`    | —               | Limits generation and Babel static transforms to an exact candidate set.                                 |
| `sourceGlobs` | `string[]`            | Auto-scanned    | Keep this scope aligned with CSS `@source`.                                                              |
| `watchFiles`  | `string[]`            | `[]`            | Additional files or directories that refresh the manifest.                                               |

`manifest`, `input`, and `css` are alternative input modes. Prefer `input`; do not maintain a second hand-written `classSet`. Metro creates a virtual module, temporary manifest files, and watchers, and adds CSS to `sourceExts`.

## CSS entry and Babel

```css title="global.css"
@import "tailwindcss";

@source "./app/**/*.{js,jsx,ts,tsx}";
@source "./src/**/*.{js,jsx,ts,tsx}";
```

Expo can keep the standard `babel-preset-expo`. The Metro wrapper connects the Babel JSX transform to the existing transformer; non-Expo or custom Metro setups can explicitly use `@weapp-tailwindcss/react-native/babel`.

```ts title="native-env.d.ts"
import '@weapp-tailwindcss/react-native/env'
```

The `env` entry augments `className` types on common React Native components. Custom components must accept and handle `className` and `style` themselves.

## Runtime model and manifest

- Complete static `className` values compile to stable StyleSheet lookups.
- Dynamic class values use `tw(value)` and only resolve generated exact candidates.
- `dark:`, `ios:`, `android:`, and `native:` use the injected `Platform.OS` and `Appearance` environment.
- Normal inline `style` overrides Tailwind; `!important` Tailwind rules override inline style.
- Unsupported CSS declarations are written to `manifest.warnings` instead of being passed silently to `StyleSheet.create`.

The main manifest fields are `version`, `classSet`, `rules`, `styleSheet`, `styleEntries`, `staticLookup`, `variables`, and `warnings`. CI can call `generateNativeStylesheet()` directly:

```ts
import { generateNativeStylesheet } from '@weapp-tailwindcss/react-native'

const manifest = await generateNativeStylesheet({
  projectRoot: process.cwd(),
  cssEntries: ['global.css'],
  sourceGlobs: ['./src/**/*.{js,jsx,ts,tsx}'],
})

if (manifest.warnings.length) {
  throw new Error(JSON.stringify(manifest.warnings))
}
```

## Boundaries and validation

- Do not register `@tailwindcss/vite` or `@tailwindcss/postcss` as a second Tailwind generator.
- Browser preflight, selector state, and unknown CSS properties are not automatically downgraded to React Native styles.
- Treat Expo Web as a smoke test; validate layout, color scheme, and platform variants on Android/iOS simulators or devices.

```bash
pnpm --filter @weapp-tailwindcss/react-native test
pnpm --filter @weapp-tailwindcss/react-native build
pnpm --filter @weapp-tailwindcss/example-react-native-expo build
pnpm e2e:react-native-compatibility
pnpm e2e:react-native:android
pnpm e2e:react-native:ios
```
