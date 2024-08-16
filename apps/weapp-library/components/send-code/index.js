/**
 * 发送短信的倒计时按钮
 * @event <tap> <end>
 */
Component({
  properties: {
    // 默认文字
    defaultText: {
      type: String,
      value: '获取验证码',
    },
    // 点击后的文字
    pendingText: {
      type: String,
      value: '发送中',
    },
    // 倒计时文字
    countingText: {
      type: String,
      value: '已发送',
    },
    // 倒计时时长
    duration: {
      type: Number,
      value: 60,
    },
  },

  data: {
    str: '', // 当前显示的文字
    disabled: false, // 倒计时过程中禁用
    timer: null, // 计时器
    leftTime: 0, // 倒计时剩余时间
  },

  attached() {
    const { defaultText, duration } = this.data
    this.setData({ str: defaultText })
    this.data.leftTime = duration
  },

  methods: {
    // 准备倒计时
    prepare() {
      this.setData({
        disabled: true,
        str: this.data.pendingText,
      })
    },

    // 开始倒计时
    start() {
      this._countDown()
    },

    // 结束倒计时
    stop() {
      clearTimeout(this.data.timer)
      this.data.leftTime = this.data.duration
      this.setData({
        disabled: false,
        str: this.data.defaultText,
      })
    },

    /**
     * 点击的时候不直接开始倒计时，父组件可以做一些参数判断
     */
    _onTap() {
      this.triggerEvent('tap')
    },

    _countDown() {
      const countingText = this.data.countingText
      if (this.data.leftTime > 0) {
        this.data.leftTime--
        this.setData({
          disabled: true,
          str: `${countingText}(${this.data.leftTime})`,
        })
        this.data.timer = setTimeout(() => {
          this._countDown()
        }, 1000)
      }
      else {
        this.stop()
        this.triggerEvent('end')
      }
    },
  },
})
