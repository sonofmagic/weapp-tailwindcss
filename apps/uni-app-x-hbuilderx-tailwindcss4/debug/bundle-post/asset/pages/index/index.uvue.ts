
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
  return _cE("view", _uM({ class: "px-4" }), [
    _cE("view", _uM({ class: "mt-[32.43rpx] bg-[#322323]" }), [
      _cE("text", _uM({ class: "text-[#844343]" }), _tD(_ctx.title), 1 /* TEXT */)
    ]),
    _cE("text", _uM({ class: "icebreaker" }), "icebreaker")
  ])
}
const GenPagesIndexIndexStyles = [_uM([["icebreaker", _pS(_uM([["color", "#844343"]]))]])]
