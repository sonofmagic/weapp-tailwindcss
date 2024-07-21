const cssMacro = require('weapp-tailwindcss/css-macro')
const { iconsPlugin, getIconCollections } = require('@egoist/tailwindcss-icons')
const plugin = require('tailwindcss/plugin')
const { isMp } = require('./platform')

module.exports = {
  content: ['./index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  //  darkMode: 'media', // or 'media' or 'class'
  darkMode: 'class',
  theme: {
    extend: {

    },
  },
  // https://weapp-tw.icebreaker.top/docs/quick-start/uni-app-css-macro
  plugins: [
    plugin(({ addVariant }) => {
      addVariant('deep', ':is(.deep &)')
      addVariant('fantasy', ':is(.fantasy &)')
    }),
    cssMacro({
      variantsMap: {
        'wx': 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true,
        },
        // mv: {
        //   value: 'H5 || MP-WEIXIN'
        // },
        // '-mv': {
        //   value: 'H5 || MP-WEIXIN',
        //   negative: true
        // }
      },
    }),
    iconsPlugin({
      // Select the icon collections you want to use
      collections: getIconCollections(['svg-spinners', 'mdi']),
    }),
  ],
  corePlugins: {
    preflight: !isMp,
    container: !isMp,
  },
}
