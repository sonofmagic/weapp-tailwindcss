import { twMerge } from '@weapp-tailwindcss/merge/v3'
import { twMerge as twMergeV4 } from '@weapp-tailwindcss/merge/v4'

Page({
  data: {
    mergedClass: twMerge('p-1 p-2 p-0.5 text-[34px] text-[#ececec]'),
    mergedClassV4: twMergeV4('p-1 p-2 p-0.5 text-[34px] text-[#ececec]'),
  },
})
