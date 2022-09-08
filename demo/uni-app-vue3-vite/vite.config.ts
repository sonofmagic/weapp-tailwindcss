import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
let vwt
if (process.env.LOCAL) {
  console.log('use local built webpack plugin')
  vwt = require('../../vite')
} else {
  vwt = require('weapp-tailwindcss-webpack-plugin/vite')
}
// import vwt from 'weapp-tailwindcss-webpack-plugin/vite';
// import postcssWeappTailwindcssRename from 'weapp-tailwindcss-webpack-plugin/postcss';

// 注意： 打包成 h5 和 app 都不需要开启插件配置
const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app'
const WeappTailwindcssDisabled = isH5 || isApp

// vite 插件配置
const vitePlugins = [uni()]
// postcss 插件配置
const postcssPlugins = [require('autoprefixer')(), require('tailwindcss')()]
if (!WeappTailwindcssDisabled) {
  vitePlugins.push(vwt())

  postcssPlugins.push(
    require('postcss-rem-to-responsive-pixel')({
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    })
  )
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: vitePlugins,
  // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
  css: {
    postcss: {
      plugins: postcssPlugins
    }
  }
})
