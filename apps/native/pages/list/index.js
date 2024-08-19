// pages/list/index.js
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    sortActive: 0,
    sortState: true,
    price: false,
    flavor: false,
    mount: false,
    page: 1,
  },
  addCart(data) {
    const item = data.currentTarget.dataset.item
  },
  sortFun(data) {
    this.setData({
      sortActive: data.currentTarget.dataset.data,
    })

    if (data.currentTarget.dataset.data === 1) {
      this.setData({
        price: (this.price = !this.price),
      })
    }
    else if (data.currentTarget.dataset.data === 2) {
      this.setData({
        flavor: (this.flavor = !this.flavor),
      })
    }
    else if (data.currentTarget.dataset.data === 3) {
      this.setData({
        mount: (this.mount = !this.mount),
      })
    }
  },
  getList(data) {},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(e) {
    wx.setNavigationBarTitle({
      title: e.title, // 页面标题为路由参数
    })
    console.log(e)
    this.getList(e)
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
