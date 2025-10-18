const { resolve, isMp } = require('./shared')
const cssMacro = require('weapp-tailwindcss/css-macro')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "pages/**/*.{vue,ts,js,wxml}"].map(resolve),
  theme: {
    extend: {
      colors: {
        primary: '#ff0000',
        second: "#00ff00"
      }
    }
  },
  plugins: [
    // https://weapp-tw.icebreaker.top/docs/quick-start/uni-app-css-macro
    cssMacro({
      variantsMap: {
        wx: 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true
        }
      }
    })
  ],
  corePlugins: {
    preflight: !isMp,
  },
};
