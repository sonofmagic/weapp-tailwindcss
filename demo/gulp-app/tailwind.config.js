const platform = process.env.PLATFORM ?? 'weapp'

const platformMap = {
  weapp: {
    template: 'wxml',
    css: 'wxss'
  },
  tt: {
    template: 'ttml',
    css: 'ttss'
  }
}

const hit = platformMap[platform]

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./src/**/*.{html,js,ts${hit ? ',' + hit.template : ''}}`],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
