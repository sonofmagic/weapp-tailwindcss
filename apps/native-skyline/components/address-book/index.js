const throttle = function throttle(func, wait, options) {
  let context
  let args
  let result = void 0
  let timeout
  let previous = 0
  if (!options) options = {}
  const later = function later() {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function () {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

Component({
  behaviors: [],
  options: {
    addGlobalClass: false,
    virtualHost: true,
    pureDataPattern: /^_/,
  },
  properties: {
    list: {
      type: Array,
      value: [],
      observer(newVal) {
        if (newVal.length === 0) return
        const alphabet = this.data.list.map((item, index) => {
          this.data._tops[index] = 2e10
          return item.alpha
        })
        this._sharedTops.value = this.data._tops
        this.setData({
          alphabet,
          current: alphabet[0]
        }, () => {
          this.computedSize()
        })
      },
    },
  },

  data: {
    current: 'A',
    intoView: '',
    touching: false,
    alphabet: [],
    _vibrated: true,
    _tops: [],
    _anchorItemH: 0,
    _anchorItemW: 0,
    _anchorTop: 0,
  },

  observers: {
    'current': function (current) {
      this._sharedCurrentIdx.value = this.data.alphabet.indexOf(current)
    },
  },

  lifetimes: {
    created() {
      this._handlePan = throttle(this._handlePan, 100, {})
      this._sharedTops = wx.worklet.shared([])
      this._sharedScrollTop = wx.worklet.shared(0)
      this._sharedHeight = wx.worklet.shared(0)
      this._sharedCurrentIdx = wx.worklet.shared(0)
    },
    attached() {
      // scroll-view 高度
      this.createSelectorQuery().select('.scroll-view').boundingClientRect(res => {
        this._sharedHeight.value = res.height
      }).exec()

      // 右侧目录计算
      const query = this.createSelectorQuery()
      query.select('.anchor-list').boundingClientRect(rect => {
        this.data._anchorItemH = rect.height / this.data.alphabet.length
        this.data._anchorItemW = rect.width
        this.data._anchorTop = rect.top
      }).exec()
    },
  },
  methods: {
    handlePan(e) {
      this._handlePan(e)
    },
    _handlePan(e) {
      const data = this.data
      const clientY = e.changedTouches[0].clientY
      const index = Math.floor((clientY - data._anchorTop) / data._anchorItemH)
      const current = data.alphabet[index]
      if (current !== this.data.current) {
        wx.vibrateShort({
          type: 'light'
        })
        this.setData({
          current,
          intoView: current,
          touching: true
        })
      }
    },
    cancelPan() {
      setTimeout(() => {
        this.setData({ touching: false })
      }, 150)
    },
    computedSize() {
      this.data.alphabet.forEach((element, index) => {
        // NOTE: 在 Skyline 下如果用了 list-view / grid-view 会有按需渲染特性，取其子节点的 clientRect
        // 时若不在屏会取不到，而这里是取 sticky-header 的，会立即渲染也就能立即返回，但 top 值是预估的。
        // 因为 list-view 的高度是预估的（第一个子节点的高度 * 数量），由于其子节点是等高，故预估是基本准确的
        this.createSelectorQuery().select(`#${element}`).boundingClientRect(res => {
          this.data._tops[index] = res.top
          this._sharedTops.value = this.data._tops
        }).exec()
      })
    },
    handleScroll(e) {
      'worklet'
      const scrollTop = e.detail.scrollTop
      // 用于计算每个 header 的 offsetTop
      this._sharedScrollTop.value = scrollTop

      // 下面判断当前选中态，按需更新
      const tops = this._sharedTops.value
      for (let i = tops.length - 1; i >= 0; i--) {
        // header 超过屏幕一半就改为选中态
        if (scrollTop + this._sharedHeight.value / 2 > tops[i]) {
          if (i !== this._sharedCurrentIdx.value) {
            // worklet 函数运行在 UI 线程，setData 调用要抛回 JS 线程执行
            wx.worklet.runOnJS(this.updateCurrent.bind(this))(i)
          }
          break
        }
      }
    },
    updateCurrent(idx) {
      if (this.data.touching) return
      this.setData({ current: this.data.alphabet[idx] })
    },
  }
})
