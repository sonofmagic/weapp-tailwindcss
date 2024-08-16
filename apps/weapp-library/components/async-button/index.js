/**
 * 异步圆角线性按钮：加载中、禁用
 * @event <tap>
 */
Component({
  properties: {
    // 按钮文字
    text: String,
    // 是否正在加载
    loading: {
      type: Boolean,
      value: false,
    },
    // 按钮类型: primary, default, warn
    type: {
      type: String,
      value: 'primary',
    },
    // 按钮大小：default，mini
    size: {
      type: String,
      value: 'default',
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    _onTap() {
      const loading = this.data.loading
      const disabled = this.data.disabled
      if (loading || disabled) {

      }
      else { this.triggerEvent('tap') }
    },
  },
})
