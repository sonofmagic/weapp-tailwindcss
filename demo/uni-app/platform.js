const isH5 = process.env.UNI_PLATFORM === "h5";
const isApp = process.env.UNI_PLATFORM === "app";

const WeappTailwindcssDisabled = isH5 || isApp;

module.exports = {
  isH5,
  isApp,
  WeappTailwindcssDisabled,
};
