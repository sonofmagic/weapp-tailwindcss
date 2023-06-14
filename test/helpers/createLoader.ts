import type { LoaderDefinitionFunction } from 'webpack'
import { createLoader } from 'create-functional-loader'

// const { createLoader } = require('simple-functional-loader')
// const name = '1234567890'

// export function createLoader (processor: LoaderDefinitionFunction) {
//   if (typeof processor !== 'function' || Function.prototype.toString.call(processor).indexOf('function')) {
//     throw new Error(name + ': parameter passed to "createLoader" must be an ES5 function.')
//   }
//   return {
//     loader: __filename,
//     options: { processor },
//     ident: name + '-' + Math.random()
//   }
// }
export default function (processor: LoaderDefinitionFunction) {
  return createLoader(processor)
}
