/** @type {import('tailwindcss').Config} */
module.exports = {
  // 假如你使用 ts 开发，则需要在下方的 glob 表达式中，把 ts 后缀配置进去 
  content: ['**/*.{js,ts,wxml}', '!node_modules/**', '!dist/**'],
  corePlugins: {
    // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false
  }
}