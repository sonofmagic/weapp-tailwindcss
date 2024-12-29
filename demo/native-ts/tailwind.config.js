import path from 'path'

/** @type {import('tailwindcss').Config} */
export default {
  important: '#app',
  // 这里给出了一份 uni-app /taro 通用示例，具体要根据你自己项目的目录结构进行配置
  // 不在 content 包括的文件内，你编写的 class，是不会生成对应的css工具类的
  content: [
    './public/index.html',
    './miniprogram/**/*.{wxml,html,js,ts,jsx,tsx,vue}',
    path.resolve(__dirname, '../../packages/tailwindcss-core-plugins-extractor/src/**/*.ts')
  ],
  // 其他配置项
  // ...
  corePlugins: {
    // 小程序不需要 preflight 和 container，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false,
    container: false,
  },
}