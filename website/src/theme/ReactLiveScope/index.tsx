// import * as WeappMerge from '@weapp-tailwindcss/merge'
import React from 'react'
import { MergeDemo } from './MergeDemo'
// Add react-live imports you need here
const ReactLiveScope: unknown = {
  React,
  ...React,
  MergeDemo,
  // ...WeappMerge,
  // create,
}

export default ReactLiveScope
