var render = function () {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c("view", {
    staticClass: "index"
  }, [_c("view", {
    class: [_vm.flag ? "bg-red-900" : "bg-[#fafa00]"]
  }, [_vm._v("bg-[#fafa00]")]), _c("view", {
    class: {
      "bg-[#098765]": _vm.flag === true
    }
  }, [_vm._v("bg-[#098765]")]), _c("view", {
    staticClass: "p-[20px] -mt-2 mb-[-20px]"
  }, [_vm._v("p-[20px] -mt-2 mb-[-20px] margin的jit 不能这么写 -m-[20px]")]), _c("view", {
    staticClass: "space-y-[1.6rem]"
  }, [_c("view", {
    staticClass: "w-[300rpx] text-black text-opacity-[0.19]"
  }, [_vm._v("w-[300rpx] text-black text-opacity-[0.19]")]), _c("view", {
    staticClass: "min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]"
  }, [_vm._v("min-w-[300rpx] max-h-[100px] text-[20px] leading-[0.9]")]), _c("view", {
    staticClass: "max-w-[300rpx] min-h-[100px] text-[#dddddd]"
  }, [_vm._v("max-w-[300rpx] min-h-[100px] text-[#dddddd]")]), _c("view", {
    staticClass: "flex items-center justify-center h-[100px] w-[100px] rounded-[40px] bg-[#123456] bg-opacity-[0.54] text-[#ffffff]"
  }, [_vm._v("Hello")]), _c("view", {
    staticClass: "border-[10px] border-[#098765] border-solid border-opacity-[0.44]"
  }, [_vm._v("border-[10px] border-[#098765] border-solid border-opacity-[0.44]")]), _c("view", {
    staticClass: "grid grid-cols-3 divide-x-[10px] divide-[#010101] divide-solid"
  }, [_c("view", [_vm._v("1")]), _c("view", [_vm._v("2")]), _c("view", [_vm._v("3")])])]), _c("view", {
    staticClass: "test"
  }, [_vm._v("test")])]);
};