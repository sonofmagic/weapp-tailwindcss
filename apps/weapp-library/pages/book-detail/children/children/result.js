Page({
  data: {
    title: undefined,
    first: undefined,
    second: undefined,
  },

  onLoad(options) {
    wx.setNavigationBarTitle({ title: options.title })
    this.setData({
      title: options.title,
      first: options.first,
      second: options.second,
    })
  },

  onBack() {
    wx.navigateBack()
  },

  onSwitch() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
})
