import { jsxHandler } from '../src/jsx/index'
// @ts-ignore
import { jsxCasePath, readFile, resolve } from './util'

function getCase (casename: string) {
  return readFile(resolve(jsxCasePath, casename))
}
describe('first', () => {
  it('case1 ', async () => {
    const item = await getCase('case1.js')
    const result = jsxHandler(item)
    expect(Boolean(result)).toBe(true)
  })

  it('case2 ', async () => {
    const item = await getCase('case2.js')
    const result = jsxHandler(item)
    expect(Boolean(result)).toBe(true)
  })

  it('case3 ', async () => {
    const item = await getCase('case3.js')
    const result = jsxHandler(item)
    expect(Boolean(result)).toBe(true)
  })

  it('vue2-case1', async () => {
    const item = await getCase('vue2-case1.js')
    const result = jsxHandler(item)
    expect(result).toBe(
      'var render = function () {\n  var _vm = this;\n\n  var _h = _vm.$createElement;\n\n  var _c = _vm._self._c || _h;\n\n  return _c("view", {\n    staticClass: "index"\n  }, [_c("view", {\n    class: [_vm.flag ? "bg-red-900" : "bg-_l__h_fafa00_r_"]\n  }, [_vm._v("bg-[#fafa00]")]), _c("view", {\n    class: {\n      "bg-_l__h_098765_r_": _vm.flag === true\n    }\n  }, [_vm._v("bg-[#098765]")]), _c("view", {\n    staticClass: "p-_l_20px_r_ -mt-2 mb-_l_-20px_r_"\n  }, [_vm._v("p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么…ffffff_r_"\n  }, [_vm._v("Hello")]), _c("view", {\n    staticClass: "border-_l_10px_r_ border-_l__h_098765_r_ border-solid border-opacity-_l_0-dot-44_r_"\n  }, [_vm._v("border-[10px] border-[#098765] border-solid border-opacity-[0.44]")]), _c("view", {\n    staticClass: "grid grid-cols-3 divide-x-_l_10px_r_ divide-_l__h_010101_r_ divide-solid"\n  }, [_c("view", [_vm._v("1")]), _c("view", [_vm._v("2")]), _c("view", [_vm._v("3")])])]), _c("view", {\n    staticClass: "test"\n  }, [_vm._v("test")])]);\n};'
    )
  })
})
