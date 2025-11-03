// import * as WeappMerge from '@weapp-tailwindcss/merge'
import React from 'react'
import { CvaDemo } from './CvaDemo'
import { MergeDemo } from './MergeDemo'
import { VariantsDemo } from './VariantsDemo'
// Add react-live imports you need here
const ReactLiveScope: unknown = {
  React,
  ...React,
  CvaDemo,
  MergeDemo,
  VariantsDemo,
  // ...WeappMerge,
  // create,
}

export default ReactLiveScope
