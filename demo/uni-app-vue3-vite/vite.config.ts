import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';

import { ViteWeappTailwindcssPlugin as vwt, postcssWeappTailwindcssRename } from '../..';
// import { ViteWeappTailwindcssPlugin as vwt, postcssWeappTailwindcssRename } from 'weapp-tailwindcss-webpack-plugin'
//
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), vwt()],
  css: {
    postcss: {
      plugins: [
        require('autoprefixer')(),
        require('tailwindcss')(),
        require('postcss-rem-to-responsive-pixel')({
          rootValue: 32,
          propList: ['*'],
          transformUnit: 'rpx'
        }),
        postcssWeappTailwindcssRename({
          // cssPreflight: {
          //   'box-sizing': false
          // }
        })
      ]
    }
  }
});
