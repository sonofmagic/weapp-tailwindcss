import { jsxHandler } from '../../src/jsx/index'
import { createReplacer } from '../../src/jsx/replacer'
import { replaceWxml } from '../../src/wxml/index'
import replace from 'regexp-replace'
import { jsxCasePath, createGetCase, createPutCase } from '../../test/util'

const getCase = createGetCase(jsxCasePath)

// const putCase = createPutCase(jsxCasePath)

async function main () {
  // const item = await getCase('vue3-createStaticVNode.js')
  // const vue3Replacer = createReplacer('vue3')
  // const result = jsxHandler(item, vue3Replacer)
  // console.log(result)
  const testCase =
    '<view class="p-[20px] -mt-2 mb-[-20px]">p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]</view><view class="space-y-[1.6rem]"><view class="w-[300rpx] text-black text-opacity-[0.19]">w-[300rpx] text-black text-opacity-[0.19]</view><view class="min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]">min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]</view><view class="max-w-[300rpx] min-h-[100px] text-[#dddddd]">max-w-[300rpx] min-h-[100px] text-[#dddddd]</view><view class="flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]">Hello</view><view class="border-[10px] border-[#098765] border-solid border-opacity-[0.44]">border-[10px] border-[#098765] border-solid border-opacity-[0.44]</view><view class="grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"><view>1</view><view>2</view><view>3</view></view></view><view class="test">test</view>'
  const regex = /(?:class|className)=(?:["']\W+\s*(?:\w+)\()?["']([^"]+)['"]/gim
  const flag = replace(testCase, regex, (x) => x) === testCase
  console.log(flag)
  // const res = testCase.replace(regex, (match, p1, offset, string) => {
  //   // console.log(p1)
  //   return '123'
  // })
  // console.log(res)
}

main()
