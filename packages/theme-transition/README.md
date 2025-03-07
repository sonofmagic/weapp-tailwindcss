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

```ts
import type { Config } from 'tailwindcss'
import { themeTransitionPlugin } from 'theme-transition/tailwindcss'

export default <Config> {
  plugins: [themeTransitionPlugin()],
}
```

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

const { toggleTheme } = useToggleTheme({
  isCurrentDark: () => {
    return isDark.value
  },
  toggle: () => {
    isDark.value = !isDark.value
  },
})

toggleTheme(MouseEvent)
```

## API

```ts
export interface UseToggleThemeOptions {
  /**
   * isDark.value = !isDark.value
   * @returns
   */
  toggle: () => void | Promise<void>
  /**
   * isDark.value
   * @returns
   */
  isCurrentDark: () => boolean
  viewTransition?: {
    before?: () => void | Promise<void>
    /**
     * await nextTick()
     * @returns
     */
    after?: () => void | Promise<void>
    callback?: () => any
  }
  duration?: number

  easing?: string
}
```

## ShowCases

https://icebreaker.top/

https://tw.icebreaker.top/

https://vite.icebreaker.top/
