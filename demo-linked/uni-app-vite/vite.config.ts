import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { UnifiedViteWeappTailwindcssPlugin as vwt } from 'weapp-tailwindcss-webpack-plugin/vite';

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
  let start;
  vitePlugins.push(
    // @ts-ignore
    vwt({
      wxsMatcher() {
        return false;
      },
      inlineWxs: true,
      jsEscapeStrategy: 'replace', // 'regenerate'
      onStart() {
        start = performance.now();
      },
      onEnd() {
        console.log('UnifiedViteWeappTailwindcssPlugin onEnd:', performance.now() - start, 'ms');
      },
      // appType: 'uni-app'
      // customReplaceDictionary: {
      //   '[': '_',
      //   ']': '_',
      //   '(': '_',
      //   ')': '-',
      // },
    }),
  );

  postcssPlugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx',
    }),
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
  build: {
    minify: false,
    sourcemap: true,
  },
});
