import type { Compiler, Stats } from './types'
export default (compiler: Compiler): Promise<Stats> =>
  new Promise((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        return reject(error)
      }

      return resolve(stats as Stats)
    })
  })
