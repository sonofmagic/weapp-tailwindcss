/**
 * 选项卡 TabBar
 * slot：不同tab的内容，“name”为对应tab的值
 * @event <click>
 */
Component({
  options: {
    multipleSlots: true,
  },
  properties: {
    tabs: {
      type: Array,
      value: ['tab1', 'tab2', 'tab3'],
    },
    // 默认激活的选项
    activeIndex: {
      type: Number,
      value: 0,
    },
  },

  data: {
    sliderOffset: 0,
    sliderWidth: 0, // slider的宽度
  },

  attached() {
    wx.getSystemInfo({
      success: (res) => {
        const sliderWidth = res.windowWidth / this.data.tabs.length
        this.setData({
          sliderOffset: sliderWidth * this.data.activeIndex,
          sliderWidth,
        })
      },
    })
  },

  methods: {
    // 设置当前激活页
    setActiveIndex(index) {
      this.setData({
        sliderOffset: this.data.sliderWidth * index,
        activeIndex: index,
      })
    },
    // 切换当前激活页
    _onClick(e) {
      const { offsetLeft, id } = e.currentTarget
      this.setData({
        sliderOffset: offsetLeft, // 或者 this.data.sliderWidth * index
        activeIndex: id,
      })
      this.triggerEvent('click', { index: id })
    },
  },
})
