import { templeteHandler } from '@/wxml/index'

describe('templeteHandler', () => {
  test('with var', async () => {
    const testCase = "<view class=\"{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-[#fafa00]']}}\"></view>"

    const str = templeteHandler(testCase)
    expect(str).toBe("<view class=\"{{['flex','flex-col','items-center',flag===1?'bg-red-900':'bg-_l__h_fafa00_r_']}}\"></view>")
  })

  it('wxs should be ignored ', () => {
    const testCase = `<wxs module="status">
    function get(index, active) {
      if (index < active) {
        return 'finish';
      } else if (index === active) {
        return 'process';
      }

      return 'inactive';
    }

    module.exports = get;
    </wxs>`
    const result = templeteHandler(testCase)

    expect(result).toBe(testCase)
  })
})
