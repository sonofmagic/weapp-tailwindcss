/** @type {import('tailwindcss').Config} */
export default {
  content: [
    '**/*.{wxml,js,ts}',
    '!node_modules',
    '!dist',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发小程序和 h5 端，你应该使用环境变量来控制它
    preflight: false,
  },
}
