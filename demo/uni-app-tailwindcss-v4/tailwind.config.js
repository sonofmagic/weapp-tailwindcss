const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons");

/** @type {import('tailwindcss').Config} */
console.log("✅ tailwind.config.js (主包) is being loaded");

module.exports = {
  content: [
    "./src/**/*.{html,js,ts,vue,jsx,tsx}",
    // ⚠️ 排除分包，避免主包体积过大
    "!./src/pages-order/**/*.{html,vue,js,ts,jsx,tsx}",
    "!./src/pages-address/**/*.{html,vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "16rpx",
      },
    },
  },
  plugins: [
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
