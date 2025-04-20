
const __sfc__ = defineComponent({
  data() {
    return {
      title: 'Hello'
    }
  },
  onLoad() {

  },
  methods: {

  }
})

export default __sfc__
function GenPagesIndexIndexRender(this: InstanceType<typeof __sfc__>): any | null {
const _ctx = this
const _cache = this.$.renderCache
return createElementVNode("view", utsMapOf({ class: "px-4" }), [
  createElementVNode("view", utsMapOf({ class: "mt-[32.43rpx] bg-[#322323]" }), [
    createElementVNode("text", utsMapOf({ class: "text-[#844343]" }), toDisplayString(_ctx.title), 1 /* TEXT */)
  ]),
  createElementVNode("text", utsMapOf({ class: "icebreaker" }), "icebreaker")
])
}
const GenPagesIndexIndexStyles = [utsMapOf([["icebreaker", padStyleMapOf(utsMapOf([["color", "#844343"]]))]])]
