// answer.js

const app = getApp()
Page({
  data: {
    motto: '知乎--微信小程序版',
    userInfo: {},
  },
  // 事件处理函数
  toQuestion() {
    wx.navigateTo({
      url: '../question/question',
    })
  },
  onLoad() {
    console.log('onLoad')
    // 调用应用实例的方法获取全局数据
    app.getUserInfo((userInfo) => {
      // 更新数据
      this.setData({
        userInfo,
      })
    })
  },
  tapName(event) {
    console.log(event)
  },
})
