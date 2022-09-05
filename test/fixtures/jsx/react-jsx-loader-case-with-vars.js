import _slicedToArray from 'G:/github2/weapp-tailwindcss-webpack-plugin/demo/taro-app/node_modules/@babel/runtime/helpers/esm/slicedToArray.js'
import { useState } from 'react'
import { View } from '@tarojs/components' // import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";

import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
import './index.scss'
import { jsx as _jsx } from 'react/jsx-runtime'
import { jsxs as _jsxs } from 'react/jsx-runtime'
import { Fragment as _Fragment } from 'react/jsx-runtime'

var Index = function Index() {
  var _useState = useState(true),
    _useState2 = _slicedToArray(_useState, 1)
    

  var className = replaceJs('bg-[#123456]')
  return /*#__PURE__*/ _jsxs(_Fragment, {
    children: [
      /*#__PURE__*/ _jsx(View, {
        className: className,
        children: 'className'
      })
    ]
  })
}

export default Index
