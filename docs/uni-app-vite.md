`uni-app` 的 `vue3/vite` 版本，使用了 `rollup base` 的插件，于是我们可以这样使用

## 1. 开始安装:

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss postcss autoprefixer
```

## 2. 然后添加 `tailwind.config.js`:

```js
module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
```

## 3. 修改 `vite.config.[jt]s` 配置

```js
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { ViteWeappTailwindcssPlugin as vwt } from 'weapp-tailwindcss-webpack-plugin'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), vwt()]
})
```

## 4. 添加 `postcss.config.js`

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    },
    // 注意添加 postcss 插件
    'weapp-tailwindcss-webpack-plugin/postcss': {}
  }
}
```

## 5. 在 `src/App.vue` 中添加:

```vue
<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
// ...
</script>
<style lang="scss">
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
</style>
```

然后就大功告成了!
