# 和 Taroify 一起使用

`taro` 使用 [Taroify](https://taroify.github.io/taroify.com/) 的共同注意点:

由于 [Taroify](https://taroify.github.io/taroify.com/) 引入后，会导致 `tailwindcss` 的样式被覆盖，[Taroify](https://taroify.github.io/taroify.com/) 样式的优先级会高于 `tailwindcss`。

## 解决方案

### 修改Taroify引入方式

按照[Taroify](https://taroify.github.io/taroify.com/) 修改引入方式，将 `taroify` 引入方式改成按需引入

```bash
# 安装插件
yarn add babel-plugin-import
```

修改Babel配置文件，修改组件和图标样式的引入方式为手动引入

```js
// babel.config.js
module.exports = {
  plugins: [
    [
      'import',
      {
        libraryName: '@taroify/core',
        libraryDirectory: '',
        // 这修改为false
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
        // 这里修改为false
        style: false,
        // style: () => "@taroify/icons/style",
        customName: name => name === 'Icon' ? '@taroify/icons/van/VanIcon' : `@taroify/icons/${name}`,
      },
      '@taroify/icons',
    ],
  ],
}
```

### 修改引入样式顺序

修改根目录下的样式引入顺序，优先引入[Taroify](https://taroify.github.io/taroify.com/) 的样式，再引入Tailwindcss的样式

```tsc
// src/app.tsx

import Taro from '@tarojs/taro'

import '@taroify/icons/index.scss'
import '@taroify/core/index.scss'
import './app.scss'

...

```

```scss
// src/app.scss

@use 'tailwindcss/base';
@use 'tailwindcss/components';
@use 'tailwindcss/utilities';
```

## 参见

- [Taroify 官方文档](https://taroify.github.io/taroify.com/)
