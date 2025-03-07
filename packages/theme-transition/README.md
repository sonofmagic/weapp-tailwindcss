# theme-transition

<video src="https://cdn.jsdelivr.net/gh/sonofmagic/static/v1/theme.mp4"></video>

## Usage

```bash
npm i theme-transition
yarn add theme-transition
pnpm add theme-transition
```

### 1. Import Js

```js
import { usetoggleTheme } from 'theme-transition'

const { toggleTheme } = usetoggleTheme({
  isCurrentDark: () => {
    return isDark.value
  },
  toggle: () => {
    isDark.value = !isDark.value
  },
  // viewTransition: {
  //   after: () => {
  //     return nextTick()
  //   },
  // },
})

toggleTheme(MouseEvent)
```

### 2. Import Style

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

```css
@import 'theme-transition/css';
```

```js
import 'theme-transition/css'
```

> css only `.dark` selector, so use scss or tailwindcss plugin

## ShowCases

https://icebreaker.top/

https://tw.icebreaker.top/

https://vite.icebreaker.top/
