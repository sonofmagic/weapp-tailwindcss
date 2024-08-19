// pages/addressAdd/index.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    region: ['广东省', '广州市', '海珠区'],
    customItem: '全部',
    name: '',
    mobile: '',
    detailed: '',
    addressIs: true,
    _id: null,
  },
  bindRegionChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    console.log(e.detail.value)
    this.setData({
      region: e.detail.value,
    })
  },
  bindKeyName(e) {
    this.setData({
      name: e.detail.value,
    })
  },
  bindKeyMobile(e) {
    this.setData({
      mobile: e.detail.value,
    })
  },
  bindKeyDetailed(e) {
    this.setData({
      detailed: e.detail.value,
    })
  },
  submitFun() {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({
        region: options.city.split(','),
        name: options.name,
        mobile: options.mobile,
        detailed: options.detailed,
        _id: options.id,
        addressIs: false,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

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
