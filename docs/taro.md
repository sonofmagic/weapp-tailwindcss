`taro 3` 内置 `webpack` 为 `4` , `postcss` 为 `8`, 所以可以使用 `tailwindcss` 的 v3 版本

注意! 从 `taro 3.5` 开始，内置的 `webpack` 为 `5` 了，所以需要使用 `TaroWeappTailwindcssWebpackPluginV5`! 详见 [taro/releases/tag/v3.5.0](https://github.com/NervJS/taro/releases/tag/v3.5.0)

## 1. 于是我们开始安装:

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss postcss autoprefixer
```

## 2. 在 taro-app/config 中添加

```js
const { TaroWeappTailwindcssWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin')

const config = {
  // ...
  mini: {
    webpackChain(chain, webpack) {
      chain.merge({
        plugin: {
          install: {
            plugin: TaroWeappTailwindcssWebpackPluginV4,
            args: [
              {
                // 注意这一行(不传默认 react)
                framework: 'react' // 'vue2' / 'vue3'
              }
            ]
          }
        }
      })
    }
  }
}
```

## 3. 执行 `npx tailwindcss init`

创建 `postcss.config.js` 和 `tailwind.config.js`

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [],
  // v3 版本的 tailwindcss 有些不同
  corePlugins: {
    preflight: false
  }
}
```

## 4. 最后在 `app.scss` 引入后就可以便捷的使用了

[v3 迁移指南](https://tailwindcss.com/docs/upgrade-guide#removed-color-aliases)

```scss
// base 是必要的
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
```
