
	const __sfc__ = defineComponent({
		data() {
			return {
				title: 'Hello',
				aaa:'text-[90px]'
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
    _cE("view", _uM({ class: "mt-_32d43rpx_ bg-_red_" }), [
      _cE("text", _uM({ class: "text-_h844343_ text-_100px_" }), _tD(_ctx.title), 1 /* TEXT */)
    ]),
    _cE("text", _uM({
      class: _nC(["icebreaker mt-_100px_", _ctx.aaa])
    }), "icebreaker", 2 /* CLASS */)
  ])
}
const GenPagesIndexIndexStyles = [_uM([["icebreaker", _pS(_uM([["color", "#844343"]]))]])]
