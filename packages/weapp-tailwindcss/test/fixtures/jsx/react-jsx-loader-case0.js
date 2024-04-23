import _slicedToArray from 'G:/github2/weapp-tailwindcss-webpack-plugin/demo/taro-app/node_modules/@babel/runtime/helpers/esm/slicedToArray.js'
import { useState } from 'react'
import { View } from '@tarojs/components' // import { useEnv, useNavigationBar, useModal, useToast } from "taro-hooks";

import { replaceJs } from 'weapp-tailwindcss-webpack-plugin/replace'
import './index.scss'
import EndClassCom from './endClassCom'
import { jsx as _jsx } from 'react/jsx-runtime'
import { jsxs as _jsxs } from 'react/jsx-runtime'
import { Fragment as _Fragment } from 'react/jsx-runtime'

var Index = function Index() {
  var _useState = useState(true),
    _useState2 = _slicedToArray(_useState, 1),
    flag = _useState2[0]

  var className = replaceJs('bg-[#123456]')
  return /*#__PURE__*/ _jsxs(_Fragment, {
    children: [
      /*#__PURE__*/ _jsx(View, {
        className: "after:border-none after:content-['Hello_World']",
        children: 'after:border-none'
      }),
      /*#__PURE__*/ _jsx(View, {
        className: 'after:content-["*"] after:ml-0.5 after:text-red-500'
      }),
      /*#__PURE__*/ _jsxs(View, {
        className: 'after:content-[*] after:ml-0.5 after:text-red-500 aspect-w-16',
        children: [
          /*#__PURE__*/ _jsx(View, {
            children: 'aspect'
          }),
          /*#__PURE__*/ _jsx(View, {
            children: 'w'
          }),
          /*#__PURE__*/ _jsx(View, {
            children: '16'
          })
        ]
      }),
      /*#__PURE__*/ _jsx(View, {
        className: 'bg-gray-100 dark:bg-zinc-800 h-10 w-10',
        hoverClass: 'bg-red-500 dark:bg-green-500'
      }),
      /*#__PURE__*/ _jsx(EndClassCom, {}),
      /*#__PURE__*/ _jsx(View, {
        className: className,
        children: 'className'
      }),
      /*#__PURE__*/ _jsx(View, {
        className: flag ? 'p-[20px] -mt-2 mb-[-20px] ' : '',
        children: 'p-[20px] -mt-2 mb-[-20px] margin\u7684jit \u53EF\u4E0D\u80FD\u8FD9\u4E48\u5199 -m-[20px]'
      }),
      /*#__PURE__*/ _jsxs(View, {
        className: 'space-y-[1.6rem] text-[16px] w-[200%]',
        children: [
          /*#__PURE__*/ _jsx(View, {
            className: 'w-[300rpx] text-black text-opacity-[0.19]',
            children: 'w-[300rpx] text-black text-opacity-[0.19]'
          }),
          /*#__PURE__*/ _jsx(View, {
            className: 'min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]',
            children: 'min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]'
          }),
          /*#__PURE__*/ _jsx(View, {
            className: 'max-w-[300rpx] min-h-[100px] text-[#dddddd]',
            children: 'max-w-[300rpx] min-h-[100px] text-[#dddddd]'
          }),
          /*#__PURE__*/ _jsx(View, {
            className: 'flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]',
            children: 'Hello'
          }),
          /*#__PURE__*/ _jsx(View, {
            className: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]',
            children: 'border-[10px] border-[#098765] border-solid border-opacity-[0.44]'
          }),
          /*#__PURE__*/ _jsxs(View, {
            className: 'grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid',
            children: [
              /*#__PURE__*/ _jsx(View, {
                children: '1'
              }),
              /*#__PURE__*/ _jsx(View, {
                children: '2'
              }),
              /*#__PURE__*/ _jsx(View, {
                children: '3'
              })
            ]
          }),
          /*#__PURE__*/ _jsx(View, {
            className: 'w-32 py-2 rounded-md font-semibold text-white bg-pink-500 ring-4 ring-pink-300',
            children: 'Default'
          })
        ]
      }),
      /*#__PURE__*/ _jsx(View, {
        className: 'test',
        children: 'test'
      })
    ]
  })
}

export default Index
