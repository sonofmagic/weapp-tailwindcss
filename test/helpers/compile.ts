import type { Compiler } from 'webpack'

export default (compiler: Compiler) =>
  new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error)
      }

      return resolve(stats)
    })
  })
