/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{css,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false,
  },
  safelist: ['px-[48rpx]'],
}
