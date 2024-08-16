let timer

const DEFAULT_CONFIG = {
  duration: 3000,
  position: 'bottom',
}

/**
 * Toast 能够自定义位置的浮动提示
 * 如果只需要居中显示，最好使用 wx.showToast()
 * TODO --- 实现淡入淡出
 */
Component({
  properties: {
    // 自定义显示位置：top，center，bottom
    position: String,
  },
  data: {
    title: '',
    show: false,
  },
  methods: {
    /**
     * 显示 Toast，父组件通过 Toast 组件的引用调用
     * @param title {String}
     * @param option {Object}
     *  -- duration：持续时长
     *  -- position：元素位置
     */
    show(title = '', options = {}) {
      // 如果已经有一个计时器在了，就先清理掉
      if (timer) {
        clearTimeout(timer)
        timer = undefined
      }

      // 扩展默认配置项
      options = Object.assign({}, DEFAULT_CONFIG, options)

      // 设置定时器，定时关闭topTips
      timer = setTimeout(() => {
        this.setData({
          show: false,
        })
      }, options.duration)

      // 展示出topTips
      this.setData({
        title,
        position: options.position,
        show: true,
      })
    },
  },
})
