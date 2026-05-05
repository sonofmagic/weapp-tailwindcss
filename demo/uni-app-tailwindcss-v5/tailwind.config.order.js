/** @type {import('tailwindcss').Config} */
console.log("✅ tailwind.config.order.js is being loaded");

module.exports = {
  content: [
    // 只扫描 pages-order 分包相关的文件
    "./src/pages-order/**/*.{html,vue,js,css,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        xl: "16rpx",
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
    container: false,
  },
};
