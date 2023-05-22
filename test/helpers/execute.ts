import Module from 'node:module'
import path from 'node:path'

const parentModule = module

export default (code: string) => {
  const resource = 'test.js'
  const module = new Module(resource, parentModule)
  // eslint-disable-next-line no-underscore-dangle
  // @ts-ignore
  module.paths = Module._nodeModulePaths(path.resolve(__dirname, '../fixtures'))
  module.filename = resource

  // eslint-disable-next-line no-underscore-dangle
  // @ts-ignore
  module._compile(`let __export__;${code};module.exports = __export__;`, resource)

  return module.exports
}
