---
title: Web direct use
description: Use weapp-tailwindcss directly in pure Web/Vite projects to generate browser-native Tailwind CSS.
keywords:
  - Web
  - H5
  - Vite
  - Tailwind CSS
  - weapp-tailwindcss
  - generator target web
  - cssEntries
  - Browser native CSS
  - Web direct use
  - vite plugin
---

# Web direct use

`weapp-tailwindcss` can be used directly in pure web projects. It is suitable for small programs and H5/Web to share the same set of Tailwind CSS generated links, or for verifying browser native output in ordinary Vite Web projects.

## Install dependencies

If the project has already installed `tailwindcss` and `weapp-tailwindcss`, you can skip this step.

```bash npm2yarn
npm install -D tailwindcss weapp-tailwindcss
```

## Prepare CSS entry

Entry CSS still has to be actually imported by the web project. `cssEntries` is only responsible for allowing `weapp-tailwindcss` to stably read `@import "tailwindcss"`, `@source` and `@config` in this entry, and will not replace Vite to generate CSS assets.

```ts title="src/main.ts"
import './style.css'
```

```css title="src/style.css"
@import "tailwindcss";

@source "./**/*.{html,js,ts,jsx,tsx,vue}";
```

## Register Vite plugin

For pure web projects, it is recommended to configure `generator.target: 'web'` explicitly. The result generated in this way will retain the browser's native Tailwind CSS selector and will not generate the class escaped by the mini program.

```ts title="vite.config.ts"
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    WeappTailwindcss({
      generator: {
        target: 'web',
      },
      cssEntries: [
        path.resolve(__dirname, 'src/style.css'),
      ],
    }),
  ],
})
```

After selecting this link, do not register `@tailwindcss/vite` or `@tailwindcss/postcss` at the same time to generate the same Tailwind CSS. Multi-end frameworks such as Taro H5, uni-app H5, Mpx Web, Weapp-vite Web, etc. will automatically switch to the `web` target according to environment variables; explicit configuration is recommended for custom web builds or pure Vite projects. For more target judgment rules, see [Cross-multi-terminal development CSS compatibility] (/docs/multi-platform).
