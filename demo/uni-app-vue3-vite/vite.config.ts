import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite';
const bench =
  process.env.WEAPP_TW_ENABLE_BENCH === '1'
    ? require('../bench.cjs')('uni-app-vite-vue3')
    : {
        start() {},
        end() {},
        dump() {},
      };


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
  postcssPlugins.push(require('weapp-tailwindcss/css-macro/postcss'));
}
let start: number;
// https://vitejs.dev/config/
export default defineConfig(async () => {
  // const { default: Inspect } = await import('vite-plugin-inspect');
  return {
    plugins: [
      uni(),
      UnifiedViteWeappTailwindcssPlugin({
        px2rpx: true,
        tailwindcssBasedir: __dirname,
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
        // cssSelectorReplacement: {
        //   universal: ['view', 'text', 'button'],
        // },
        disabled: WeappTailwindcssDisabled,
        // customReplaceDictionary: {
        //   '[': '_',
        //   ']': '_',
        //   '(': '_',
        //   ')': '-',
        // },
      }),
      // Inspect({
      //   build: true,
      //   outputDir: '.vite-inspect'
      // })
      // {
      //   name: 'x',
      //   transform(code, id) {
      //     if (id.includes('node_modules')) {

      //     } else {
      //       console.log(code, id)
      //     }

      //     // return code
      //   }
      // }
    ],
    resolve: {
      alias: {
        path: 'path-browserify',
        'entities/decode': 'entities/lib/decode.js',
        url: 'node:url',
      },
    },
    optimizeDeps: {
      include: ['path-browserify', 'entities/lib/decode.js'],
    },
    // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
    css: {
      postcss: {
        plugins: postcssPlugins,
      },
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api', 'import'],
        },
      }
    },

    build: {
      minify: false,
      sourcemap: true,
    },
  }
});
