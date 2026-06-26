const path = require('node:path')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const { getMetroConfig } = require('@tarojs/rn-supporter')

const projectRoot = __dirname
const workspaceRoot = path.resolve(__dirname, '../..')

const config = {
  projectRoot,
  watchFolders: [workspaceRoot],
  resolver: {
    extraNodeModules: new Proxy({}, {
      get: (_target, name) => path.join(projectRoot, 'node_modules', name),
    }),
  },
}

module.exports = (async function () {
  return mergeConfig(getDefaultConfig(projectRoot), await getMetroConfig(), config)
})()
