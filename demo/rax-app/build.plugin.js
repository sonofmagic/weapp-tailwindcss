// build.plugin.js
const { RemaxWeappTailwindcssWebpackPluginV4 } = require('../../');

module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    // console.log(config);
    // compiler.webpack.version 5.65.0
    config.plugin('RaxWeappTailwindcssWebpackPluginV4').use(RemaxWeappTailwindcssWebpackPluginV4);
  });
};
