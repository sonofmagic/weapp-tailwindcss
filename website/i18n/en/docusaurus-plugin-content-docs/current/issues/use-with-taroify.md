---
title: Use with Taroify
description: 'taro Common points to note when using Taroify:'
keywords:
  - FAQ
  - Troubleshooting
  - compatibility
  - Taroify
  - used together
  - issues
  - use with taroify
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# Used with Taroify

`taro` Common points to note when using [Taroify](https://taroify.github.io/taroify.com/):

Since the introduction of [Taroify](https://taroify.github.io/taroify.com/) will cause the style of `tailwindcss` to be overwritten, the priority of the [Taroify](https://taroify.github.io/taroify.com/) style will be higher than that of `tailwindcss`.

## Solution

### Modify Taroify introduction method

Modify the import method according to [Taroify](https://taroify.github.io/taroify.com/) and change the `taroify` import method to on-demand import.

```bash npm2yarn
# Install plugin
npm i babel-plugin-import
```

Modify the Babel configuration file and modify the import method of components and icon styles to manual import.

```js
// babel.config.js
module.exports = {
  plugins: [
    [
      'import',
      {
        libraryName: '@taroify/core',
        libraryDirectory: '',
// Change this to false
        style: false,
        // style: false,
      },
      '@taroify/core',
    ],
    [
      'import',
      {
        libraryName: '@taroify/icons',
        libraryDirectory: '',
        camel2DashComponentName: false,
//Change here to false
        style: false,
        // style: () => "@taroify/icons/style",
        customName: name => name === 'Icon' ? '@taroify/icons/van/VanIcon' : `@taroify/icons/${name}`,
      },
      '@taroify/icons',
    ],
  ],
}
```

### Modify the order of imported styles

Modify the order of style introduction in the root directory, first introduce the style of [Taroify](https://taroify.github.io/taroify.com/), and then introduce the style of Tailwindcss

```tsx
// src/app.tsx

import Taro from '@tarojs/taro'

import '@taroify/icons/index.scss'
import '@taroify/core/index.scss'
import './app.scss'

// ...

```

```scss
// src/app.scss

@use 'tailwindcss/base';
@use 'tailwindcss/components';
@use 'tailwindcss/utilities';
```

## See

- [Taroify official documentation](https://taroify.github.io/taroify.com/)
