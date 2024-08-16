// index.js
import * as util from '@/utils/util'
// const util = require('../../utils/util.js')

Page({
  data: {
    feed: [],
    feed_length: 0,
  },
  // 事件处理函数
  bindItemTap() {
    wx.navigateTo({
      url: '../answer/answer',
    })
  },
  bindQueTap() {
    wx.navigateTo({
      url: '../question/question',
    })
  },
  onLoad() {
    console.log('onLoad')

    // 调用应用实例的方法获取全局数据
    this.getData()
  },
  upper() {
    wx.showNavigationBarLoading()
    this.refresh()
    console.log('upper')
    setTimeout(() => {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }, 2000)
  },
  lower() {
    wx.showNavigationBarLoading()

    setTimeout(() => {
      wx.hideNavigationBarLoading()
      this.nextLoad()
    }, 1000)
    console.log('lower')
  },
  // scroll: function (e) {
  //  console.log("scroll")
  // },

  // 网络请求数据, 实现首页刷新
  refresh0() {
    const index_api = ''
    util.getData(index_api)
      .then((data) => {
        // this.setData({
        //
        // });
        console.log(data)
      })
  },

  // 使用本地 fake 数据实现刷新效果
  getData() {
    const feed = util.getData2()
    console.log('loaddata')
    const feed_data = feed.data
    this.setData({
      feed: feed_data,
      feed_length: feed_data.length,
    })
  },
  refresh() {
    wx.showToast({
      title: '刷新中',
      icon: 'loading',
      duration: 3000,
    })
    const feed = util.getData2()
    console.log('loaddata')
    const feed_data = feed.data
    this.setData({
      feed: feed_data,
      feed_length: feed_data.length,
    })
    setTimeout(() => {
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 2000,
      })
    }, 3000)
  },

  // 使用本地 fake 数据实现继续加载效果
  nextLoad() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 4000,
    })
    const next = util.getNext()
    console.log('continueload')
    const next_data = next.data
    this.setData({
      feed: this.data.feed.concat(next_data),
      feed_length: this.data.feed_length + next_data.length,
    })
    setTimeout(() => {
      wx.showToast({
        title: '加载成功',
        icon: 'success',
        duration: 2000,
      })
    }, 3000)
  },

})
