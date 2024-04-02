import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { UnifiedViteWeappTailwindcssPlugin as vwt } from 'weapp-tailwindcss-webpack-plugin/vite';
const bench = require('../bench')('uni-app-vite-vue3');
// import Unocss from 'unocss/vite';
// import WindiCSS from 'vite-plugin-windicss';

// if (process.env.LOCAL) {
//   console.log('use local built webpack plugin');
//   const { UnifiedViteWeappTailwindcssPlugin } = require('./weapp-tw-dist/vite');
//   vwt = UnifiedViteWeappTailwindcssPlugin;
// } else {
//   const { UnifiedViteWeappTailwindcssPlugin } = require('weapp-tailwindcss-webpack-plugin/vite');
//   vwt = UnifiedViteWeappTailwindcssPlugin;
// }
// const { UnifiedViteWeappTailwindcssPlugin: vwt } = require('weapp-tailwindcss-webpack-plugin/vite');

// import vwt from 'weapp-tailwindcss-webpack-plugin/vite';
// import postcssWeappTailwindcssRename from 'weapp-tailwindcss-webpack-plugin/postcss';

// 注意： 打包成 h5 和 app 都不需要开启插件配置
const isH5 = process.env.UNI_PLATFORM === 'h5';
const isApp = process.env.UNI_PLATFORM === 'app-plus';
const WeappTailwindcssDisabled = isH5 || isApp;
// vite 插件配置
const vitePlugins = [uni()]; // Unocss()
// postcss 插件配置
const postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()];

// const postcssPlugins = [require('postcss-windicss')()];

// const postcssPlugins = [];
if (!WeappTailwindcssDisabled) {
  // postcssPlugins.push(
  //   require('postcss-rem-to-responsive-pixel')({
  //     rootValue: 32,
  //     propList: ['*'],
  //     transformUnit: 'rpx',
  //   }),
  // );
  postcssPlugins.push(require('weapp-tailwindcss-webpack-plugin/css-macro/postcss'));
}
let start;
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    vwt({
      wxsMatcher() {
        return false;
      },
      inlineWxs: true,
      // jsEscapeStrategy: 'replace', // 'regenerate'
      onStart() {
        bench.start();
        start = performance.now();
      },
      onEnd() {
        bench.end();
        bench.dump();
        console.log('UnifiedWebpackPluginV5 onEnd:', performance.now() - start, 'ms');
      },
      rem2rpx: true,
      jsAstTool: bench.useBabel ? 'babel' : 'ast-grep',
      cssSelectorReplacement: {
        universal: ['view', 'text', 'button'],
      },
      disabled: WeappTailwindcssDisabled,
      // appType: 'uni-app'
      // customReplaceDictionary: {
      //   '[': '_',
      //   ']': '_',
      //   '(': '_',
      //   ')': '-',
      // },
    }),
  ],
  // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
  },
  build: {
    minify: false,
    sourcemap: true,
  },
});
