const path = require("path");
const isH5 = process.env.UNI_PLATFORM === "h5";
const isApp = process.env.UNI_PLATFORM === "app";
// https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template/issues/6

const resolve = (p) => {
  return path.resolve(__dirname, p);
};
const WeappTailwindcssDisabled = isH5 || isApp;

module.exports = {
  isH5,
  isApp,
  WeappTailwindcssDisabled,
  resolve
};
