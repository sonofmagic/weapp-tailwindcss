let timer

const DEFAULT_CONFIG = {
  duration: 3000,
  type: 'error', // warn、success、error
}

/**
 * 顶部提示
 */
Component({
  properties: {
    content: String,
  },
  data: {
    type: '',
    show: false,
  },

  methods: {
    /**
     * 显示 TopTip，父组件通过 TopTip 组件的引用调用
     * @param content {String}
     * @param option {Object}
     *  -- duration：持续时长
     *  -- type：提示类型
     */
    show(content = '', options = {}) {
      // 如果已经有一个计时器在了，就先清理掉
      if (timer) {
        clearTimeout(timer)
        timer = undefined
      }

      // 扩展默认参数
      options = Object.assign({}, DEFAULT_CONFIG, options)

      // 设置定时器，定时关闭
      timer = setTimeout(() => {
        this.setData({
          show: false,
        })
      }, options.duration)

      // 展示出topTips
      this.setData({
        content,
        type: options.type,
        show: true,
      })
    },
  },
})
