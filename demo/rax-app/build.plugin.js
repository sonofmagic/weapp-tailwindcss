// build.plugin.js
const { RaxTailwindcssWebpackPluginV5 } = require('../../');
// const { RaxTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    // console.log(config);
    // compiler.webpack.version 5.65.0
    config.plugin('RaxTailwindcssWebpackPluginV5').use(RaxTailwindcssWebpackPluginV5, [{
      // cssPreflight: {
      //   'box-sizing': 'content-box',
      //   'background': 'black'
      // }
    }]);
  });
};
