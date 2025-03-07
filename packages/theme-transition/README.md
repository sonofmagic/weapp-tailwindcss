# theme-transition

## Usage

```bash
pnpm add theme-transition
```

## Import Js

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

## Import Style

### Scss

```scss
@use 'theme-transition/scss/mixins.scss' as M;
// pass your theme css selector
@include M.theme-transition('[data-theme="dark"]');
```

### Tailwindcss Plugin

```ts
import type { Config } from 'tailwindcss'
import { themeTransitionPlugin } from 'theme-transition/tailwindcss'

export default <Config> {
  plugins: [themeTransitionPlugin()],
}
```

### Css

```css
@import 'theme-transition/css';
```

```js
import 'theme-transition/css'
```

> css only `.dark` selector, so use scss or tailwindcss plugin
