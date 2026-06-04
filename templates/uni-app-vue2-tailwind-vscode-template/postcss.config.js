const path = require("path");
const webpack = require('webpack');

const config = {
  parser: require("postcss-comment"),
  plugins: [
    require("postcss-import")({
      resolve(id, basedir, importOptions) {
        if (id.startsWith("~@/")) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(3));
        } else if (id.startsWith("@/")) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(2));
        } else if (id.startsWith("/") && !id.startsWith("//")) {
          return path.resolve(process.env.UNI_INPUT_DIR, id.substr(1));
        }
        return id;
      },
    }),
    require("autoprefixer")({
      remove: process.env.UNI_PLATFORM !== "h5",
    }),
    // Tailwind CSS 由 weapp-tailwindcss 生成模式接管，这里不要再注册 tailwindcss
    require('weapp-tailwindcss/css-macro/postcss'),
    require("@dcloudio/vue-cli-plugin-uni/packages/postcss"),
  ],
};

if (webpack.version[0] > 4) {
  delete config.parser
}

module.exports = config
