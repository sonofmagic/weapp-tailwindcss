// tailwindcss-miniprogram-preset 适合那种 webpack 无法触及的场景
const { resolve } = require('./platform')
// 基础配置，无需任何preset
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/uni-app/tailwind.config.js
/** @type {import('@types/tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  mode: "jit",
  purge: {
    content: [
      resolve("./index.html"),
      resolve("./pages/**/*.{vue,js,ts,jsx,tsx,wxml}"),
      resolve("./pagesA/**/*.{vue,js,ts,jsx,tsx,wxml}"),
      resolve("./pagesB/**/*.{vue,js,ts,jsx,tsx,wxml}"),
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
