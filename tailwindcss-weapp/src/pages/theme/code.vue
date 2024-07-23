<script lang="ts" setup>
import mpHtml from 'uni-app-mp-html/components/mp-html/mp-html.vue'

const content
      = '```js\n'
      + `const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx,wxml}'],
  // darkMode: 'class', 3.4.1 版本 tailwindcss 之前可行
  darkMode: ['variant', ':is(.dark &)']
  theme: {
    extend: {
      colors: {
        primary: 'rgba(var(--ice-color-primary), <alpha-value>)',
        'primary-content':
          'rgba(var(--ice-color-primary-content), <alpha-value>)',
        base: 'rgba(var(--ice-color-base), <alpha-value>)'
      }
    }
  },
  variants: {},
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('deep', ':is(.deep &)')
      addVariant('fantasy', ':is(.fantasy &)')
    }),
  ],
  corePlugins: {
    preflight: false,
    container: false
  }
}
`
      + '```\n'
</script>

<template>
  <view>
    <mpHtml markdown :content="content" />
  </view>
</template>

<style lang="scss">
page {
  background: #2d2d2d;
}
</style>
