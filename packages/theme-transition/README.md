# theme-transition

![](https://cdn.jsdelivr.net/gh/sonofmagic/static/v1/theme.gif)

## Usage

### 0. Install

```bash
npm i theme-transition
yarn add theme-transition
pnpm add theme-transition
```

### 1. Import Style

#### Scss

```scss
@use 'theme-transition/scss/mixins.scss' as M;
// pass your theme css selector
@include M.theme-transition('[data-theme="dark"]');
```

#### Tailwindcss Plugin

##### Tailwind CSS v3

```ts
// tailwind.config.cjs
const { themeTransitionPlugin } = require('theme-transition/tailwindcss')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  plugins: [themeTransitionPlugin()],
}
```

or with ESM syntax:

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { themeTransitionPlugin } from 'theme-transition/tailwindcss'

export default {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  plugins: [themeTransitionPlugin()],
} satisfies Config
```

##### Tailwind CSS v4

With the new Tailwind CSS v4 tooling, plugins are registered directly from your CSS entry file via the `@plugin` directive:

```css
/* tailwind.css */
@import 'tailwindcss';
@plugin 'theme-transition/tailwindcss';
```

To customise the plugin you can pass an options object to `@plugin`:

```css
@import 'tailwindcss';

@plugin 'theme-transition/tailwindcss' ({
  zIndex: {
    ceiling: 9999,
  },
});
```

This works out of the box with any of the official v4 runners such as `@tailwindcss/postcss` or `@tailwindcss/vite`.

#### Css

in your css file.

```css
@import 'theme-transition/css';
```

or in your js file.

```js
import 'theme-transition/css'
```

> css only `.dark` selector, so use scss or tailwindcss plugin

### 2. Import Js

```js
import { useToggleTheme } from 'theme-transition'

const { toggleTheme, capabilities, environment } = useToggleTheme({
  isCurrentDark: () => {
    return isDark.value
  },
  toggle: () => {
    isDark.value = !isDark.value
  },
})

toggleTheme(MouseEvent)

if (!capabilities.hasViewTransition) {
  // gracefully handle browsers that do not support the API
}

console.log(environment.target)
```

## API

```ts
export interface UseToggleThemeOptions {
  /**
   * isDark.value = !isDark.value
   * @returns
   */
  toggle?: () => void | Promise<void>
  /**
   * isDark.value
   * @returns
   */
  isCurrentDark?: () => boolean
  viewTransition?: {
    before?: () => void | Promise<void>
    /**
     * await nextTick()
     * @returns
     */
    after?: () => void | Promise<void>
    callback?: () => void | Promise<void>
  }
  duration?: number

  easing?: string
  document?: Document
  window?: Window & typeof globalThis
  animationTarget?: Element | (() => Element | null)
  fallbackCoordinates?: { x: number, y: number } | ((context: { viewportWidth: number, viewportHeight: number, target: Element | null }) => { x: number, y: number } | null | undefined)
  logger?: Pick<Console, 'warn'>
}

export interface UseToggleThemeResult {
  toggleTheme: (event?: { clientX: number, clientY: number }) => Promise<void>
  isAppearanceTransition: boolean
  capabilities: {
    hasViewTransition: boolean
    prefersReducedMotion: boolean
    supportsAnimate: boolean
  }
  environment: {
    document: Document | undefined
    window: (Window & typeof globalThis) | undefined
    target: Element | null
  }
}
```

`fallbackCoordinates` lets you define a focal point for keyboard-triggered toggles, ensuring the transition still animates even without a pointer event. Supply either a static point or a function that receives the viewport size.

`capabilities` exposes the detected browser support flags so you can degrade gracefully, while `environment` surfaces the resolved DOM handles used internally if you need to customise behaviour further.

## ShowCases

https://icebreaker.top/

https://tw.icebreaker.top/

https://vite.icebreaker.top/
