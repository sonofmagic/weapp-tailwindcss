// build.plugin.js
let RaxTailwindcssWebpackPluginV5;
if (process.env.LOCAL) {
  console.log('use local built webpack plugin');
  const { RaxTailwindcssWebpackPluginV5: plugin } = require('./weapp-tw-dist');
  RaxTailwindcssWebpackPluginV5 = plugin;
} else {
  const { RaxTailwindcssWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin');
  RaxTailwindcssWebpackPluginV5 = plugin;
}

// const { RaxTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    // console.log(config);
    // compiler.webpack.version 5.65.0
    config.plugin('RaxTailwindcssWebpackPluginV5').use(RaxTailwindcssWebpackPluginV5, [
      {
        // cssPreflight: {
        //   'box-sizing': 'content-box',
        //   'background': 'black'
        // }
      },
    ]);
  });
};
