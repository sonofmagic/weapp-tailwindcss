const plugin = require('tailwindcss/plugin')
const cssMacro = require('weapp-tailwindcss/css-macro')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  plugins: [
    plugin(function ({ addUtilities }) {
      // 这一段代码源自于
      // const { corePlugins } = require('tailwindcss/lib/corePlugins')
      // corePlugins.display 这个插件
      addUtilities({
        '.block': {
          display: 'block'
        },
        '.inline-block': {
          display: 'inline-block'
        },
        '.inline': {
          display: 'inline'
        },
        '.flex': {
          display: 'flex'
        },
        '.inline-flex': {
          display: 'inline-flex'
        },
        '.table': {
          display: 'table'
        },
        '.inline-table': {
          display: 'inline-table'
        },
        '.table-caption': {
          display: 'table-caption'
        },
        '.table-cell': {
          display: 'table-cell'
        },
        '.table-column': {
          display: 'table-column'
        },
        '.table-column-group': {
          display: 'table-column-group'
        },
        '.table-footer-group': {
          display: 'table-footer-group'
        },
        '.table-header-group': {
          display: 'table-header-group'
        },
        '.table-row-group': {
          display: 'table-row-group'
        },
        '.table-row': {
          display: 'table-row'
        },
        '.flow-root': {
          display: 'flow-root'
        },
        '.grid': {
          display: 'grid'
        },
        '.inline-grid': {
          display: 'inline-grid'
        },
        '.contents': {
          display: 'contents'
        },
        // list-item不需要 这里就注释
        // '.list-item': {
        //   display: 'list-item'
        // },
        '.hidden': {
          display: 'none'
        }
      })
    }),
    cssMacro({
      variantsMap: {
        wx: 'MP-WEIXIN',
        '-wx': {
          value: 'MP-WEIXIN',
          negative: true
        },
        mv: {
          value: 'H5 || MP-WEIXIN'
        },
        '-mv': {
          value: 'H5 || MP-WEIXIN',
          negative: true
        }
      }
    })
  ],
  corePlugins: {
    preflight: false,
    // 要把原先的 display corePlugins 去掉，不然无法去除 .list-item
    display: false
  },
  theme: {}
}
