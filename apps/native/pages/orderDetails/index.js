// pages/orderDetails/index.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [
      {
        // 商品列表
        id: 2,
        img: 'https://wx.yogalt.com/file/images/img1.jpeg',
        name: '榴恋草莓蛋糕-2磅188元/138元/4磅298元（深圳）',
        spec: '2磅，+19.9元得水果（中盒）…',
        price: 999,
        num: 2,
        select: false,
      },
      {
        id: 3,
        img: 'https://wx.yogalt.com/file/images/img1.jpeg',
        name: '榴恋草莓蛋糕-2磅188元/138元/4磅298元（深圳）',
        spec: '2磅，+19.9元得水果（中盒）…',
        price: 999.01,
        num: 1,
        select: false,
      },
    ],
    address: null,
    data: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.setData({
      address: app.globalData.userInfo.address,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
})
