import { getSonNumbersByNumber } from '../../../apis/classification'

Page({
  data: {
    number: 0, // 当前分类号，默认为根分类号‘0’
    sonNumbers: [], // 子分类号
    loadMoreStatus: 'hidding', // loading, nomore
  },

  onLoad(options) {
    this.setData({ number: options.number || 0 })
    wx.setNavigationBarTitle({ title: options.name || '分类检索' })
    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData().then((sonNumbers) => {
      this.setData({ sonNumbers: this.data.sonNumbers.concat(sonNumbers) })
    }).finally(() => wx.hideLoading())
  },

  onReachBottom() {
    const { loadMoreStatus, isNoData, sonNumbers } = this.data
    if (loadMoreStatus !== 'hidding' || isNoData) { return }

    this.setData({ loadMoreStatus: 'loading' })
    this._fetchData(sonNumbers.length).then((sonNumbers) => {
      this.setData({
        sonNumbers: this.data.sonNumbers.concat(sonNumbers),
        loadMoreStatus: sonNumbers.length === 0 ? 'nomore' : 'hidding',
      })
    }).catch(() => this.setData({ loadMoreStatus: 'hidding' }))
  },

  _fetchData(start = 0) {
    return getSonNumbersByNumber(this.data.number, start).then(res => res.data.son_numbers)
  },
})
