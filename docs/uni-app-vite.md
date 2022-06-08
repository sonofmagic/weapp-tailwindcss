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
import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

import vwt from 'weapp-tailwindcss-webpack-plugin/vite';
import postcssWeappTailwindcssRename from 'weapp-tailwindcss-webpack-plugin/postcss';

const isH5 = process.env.UNI_PLATFORM === 'h5';
// vite 插件配置
const vitePlugins = [uni()];
// postcss 插件配置
const postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()];
if (!isH5) {
  vitePlugins.push(vwt());

  postcssPlugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx',
    })
  );
  postcssPlugins.push(
    postcssWeappTailwindcssRename({
      // cssPreflight: {
      //   'box-sizing': false,
      // },
    })
  );
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: vitePlugins,
  // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
  },
});

```

## 4. 在 `src/App.vue` 中添加:

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

## 注意点

1. 上述示例的 `vite.config.[jt]s` 配置中， `vwt()` 一定要放在 `uni()` 的后面，这样才能针对 `@dcloudio/vite-plugin-uni` 的产物进行转义

2. 这里我采用的内联 `postcss` 配置的方式去做，因为有时候 `postcss.config.js` 配置会不起作用