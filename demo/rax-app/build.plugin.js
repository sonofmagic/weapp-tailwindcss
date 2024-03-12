// build.plugin.js
// let UnifiedWebpackPluginV5;
// if (process.env.LOCAL) {
//   console.log('use local built webpack plugin');
//   const { UnifiedWebpackPluginV5: plugin } = require('./weapp-tw-dist');
//   UnifiedWebpackPluginV5 = plugin;
// } else {
//   const { UnifiedWebpackPluginV5: plugin } = require('weapp-tailwindcss-webpack-plugin/webpack');
//   UnifiedWebpackPluginV5 = plugin;
// }
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin/webpack');

// const { RaxTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    // console.log(config);
    // compiler.webpack.version 5.65.0
    config.plugin('RaxTailwindcssWebpackPluginV5').use(UnifiedWebpackPluginV5, [
      {
        appType: 'rax',
        rem2rpx: true,
        // jsAstTool: 'ast-grep',
        // cssPreflight: {
        //   'box-sizing': 'content-box',
        //   'background': 'black'
        // }
      },
    ]);
  });
};
