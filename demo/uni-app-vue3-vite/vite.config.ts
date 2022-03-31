import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
// console.log(process.env.UNI_PLATFORM);

const isH5 = process.env.UNI_PLATFORM === 'h5';

import { ViteWeappTailwindcssPlugin as vwt, postcssWeappTailwindcssRename } from '../..';
// import { ViteWeappTailwindcssPlugin as vwt, postcssWeappTailwindcssRename } from 'weapp-tailwindcss-webpack-plugin'
//
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(), isH5 ? undefined : vwt()]
  // 假如 postcss.config.js 不起作用，请使用内联 postcss
  // css: {
  //   postcss: {
  //     plugins: [
  //       require('autoprefixer')(),
  //       require('tailwindcss')(),
  //       require('postcss-rem-to-responsive-pixel')({
  //         rootValue: 32,
  //         propList: ['*'],
  //         transformUnit: 'rpx'
  //       }),
  //       postcssWeappTailwindcssRename()
  //     ]
  //   }
  // }
});
