/**
 * 折叠面板
 * TODO --- 动画展开
 * slot：折叠区域
 * @event <show> <hide> <tapaction>
 */
Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    // 标题
    title: String,
    // 标题栏右侧操作按钮的文字
    actionText: {
      type: String,
      value: '',
    },
    show: {
      type: Boolean,
      value: true,
    },
  },
  externalClasses: ['header-class'], // 自定义标题类
  methods: {
    _toggle() {
      this.setData({ show: !this.data.show })
      if (this.data.show) {
        this.triggerEvent('show')
      }
      else {
        this.triggerEvent('hide')
      }
    },
    _onTapAction() {
      this.triggerEvent('tapaction')
    },
  },
})
