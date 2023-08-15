// index.js
// 获取应用实例
// const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    contentStyle: 'mt-[24px]',
    classNames: "bg-[url('https://xxx.com/xx.webp')] text-[#123456] text-[50px] bg-[#fff]",
    wildContent: '******',
    arr: [1]
  },
  onLoad: function () {},
  copyText: function (e: any) {
    const txt = e.currentTarget.dataset.text
    wx.setClipboardData({
      data: txt,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功！',
              icon: 'success',
              duration: 1000
            })
          }
        })
      }
    })
  }
})
