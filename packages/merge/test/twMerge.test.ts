import { twMerge } from '@/v3'
import { twMerge as twMergeV4 } from '@/v4'

describe('v3', () => {
  it('should ', () => {
    expect(twMerge('p-1 p-2 p-0.5')).toBe('p-0d5')
    expect(twMerge('text-[34px]', 'text-[#ececec]')).toBe('text-_34px_ text-_hececec_')
    expect(twMerge('text-[34px]', 'text-[#ECECEC]')).toBe('text-_34px_ text-_hECECEC_')
    expect(twMergeV4('text-[34px]', 'text-[#ECECEC]')).toBe('text-_34px_ text-_hECECEC_')
    expect(twMerge('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0d5 text-_34px_ text-_hececec_')
    expect(twMergeV4('p-1 p-2 p-0.5 text-[34px] text-[#ececec]')).toBe('p-0d5 text-_34px_ text-_hececec_')
  })
})
