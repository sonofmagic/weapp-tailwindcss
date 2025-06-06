// postcss.config.js
module.exports = ({ options }) => ({
  plugins: {
    // 继承 Rsmax 默认的插件配置
    ...options.plugins,
    // 添加其他插件
    tailwindcss: {},
    autoprefixer: {},
  },
})
