
const { WeappTailwindcssWebpackPlugin } = require('../../')
/**
 * @type {import('next').NextConfig} config
 */
const config = {
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(new WeappTailwindcssWebpackPlugin())
    
    return config
  },
}

module.exports = config 
