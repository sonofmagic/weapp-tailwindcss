import type { fabric as FabricType } from 'fabric'
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment'
let fabric: typeof FabricType | undefined = undefined
if (ExecutionEnvironment.canUseDOM) {
  fabric = require('fabric').fabric
}

export {
  fabric
}