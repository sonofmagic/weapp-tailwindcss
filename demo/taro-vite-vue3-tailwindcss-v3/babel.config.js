// babel-preset-taro 更多选项和默认值：
// https://github.com/NervJS/taro/blob/next/packages/babel-preset-taro/README.md
module.exports = {
  presets: [
    ['taro', {
      framework: process.env.TARO_ENV === 'rn' ? 'react' : 'vue3',
      ts: true,
      compiler: 'vite',
    }]
  ]
}
