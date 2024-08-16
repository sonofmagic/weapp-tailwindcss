Page({
  data: {
  },

  onShowCollapse() {
    wx.showModal({
      content: '显示 collapse 内容',
      showCancel: false,
    })
  },

  onHideCollapse() {
    wx.showModal({
      content: '隐藏 collapse 内容',
      showCancel: false,
    })
  },

  onTapAction() {
    wx.showModal({
      content: '点击了操作按钮',
      showCancel: false,
    })
  },
})
