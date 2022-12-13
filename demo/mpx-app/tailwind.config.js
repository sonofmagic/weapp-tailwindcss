/** @type {import('tailwindcss').Config} */
module.exports = {
    // content 是用来指定让 tailwindcss 从哪些文件中提取字符串，来生成对应的工具类
    content: ['./src/**/*.mpx'],
    theme: {
        extend: {}
    },
    plugins: [],
    // 去除 preflight ，因为 preflight.css 主要用来 reset h5 的样式的
    // 如果你有多端需求，可以通过环境变量来控制这个值
    corePlugins: {
        preflight: false
    }
}
