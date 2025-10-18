const path = require("path");
// 注意： 打包成 h5 和 app 都不需要开启插件配置
const isH5 = process.env.UNI_PLATFORM === "h5";
const isApp = process.env.UNI_PLATFORM === "app";
const WeappTailwindcssDisabled = isH5 || isApp;
const isMp = !isH5 && !isApp
const resolve = (p) => {
    return path.resolve(__dirname, p);
};

module.exports = {
    WeappTailwindcssDisabled,
    resolve,
    isMp
}