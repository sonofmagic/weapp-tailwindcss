const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons");
const darkMode = require('../dark-mode.cjs');
// H5 Iconify HMR 回归会临时注入 i-[...]，关闭旧 i 前缀插件避免同前缀冲突遮盖回归目标。
const disableEgoistIcons = process.env.WEAPP_TW_DISABLE_EGOIST_ICONS === '1'
  || process.env.WEAPP_TW_WATCH_REGRESSION === '1';

/** @type {import('tailwindcss').Config} */
console.log("✅ tailwind.config.js (主包) is being loaded");

module.exports = {
  content: [
    "./src/**/*.{html,js,ts,vue,jsx,tsx}",
    // ⚠️ 排除分包，避免主包体积过大
    "!./src/pages-order/**/*.{html,vue,js,ts,jsx,tsx}",
    "!./src/pages-address/**/*.{html,vue,js,ts,jsx,tsx}",
  ],
  darkMode,
  theme: {
    extend: {
      borderRadius: {
        xl: "16rpx",
      },
    },
  },
  plugins: disableEgoistIcons
    ? []
    : [
        iconsPlugin({
          collections: getIconCollections(["mdi", "lucide"]),
        }),
      ],
  // v3 版本的 tailwindcss 有些不同
  corePlugins: {
    preflight: false,
    container: false,
  },
};
