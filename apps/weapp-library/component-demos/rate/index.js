Page({
  onChange(e) {
    console.log(e)
    wx.showModal({
      content: `当前评分: ${e.detail.value}`,
      showCancel: false,
    })
  },
})
