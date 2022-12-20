// const { WeappTailwindcssWebpackPlugin } = require('../../')
// const { BaseTemplateWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
// new BaseTemplateWebpackPluginV5({})
/**
 * @type {import('next').NextConfig} config
 */
const config = {
  reactStrictMode: true,
  // webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  //   config.plugins.push(new WeappTailwindcssWebpackPlugin())

  //   return config
  // },
}

module.exports = config 
