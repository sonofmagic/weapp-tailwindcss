import { getRankingBooks, getRecommendedBooksByUserId } from '../../apis/book'
import { getRecommendedBooklistsByUserId } from '../../apis/booklist'
import { showTip } from '../../utils/tip'
import { getUID } from '../../utils/permission'
import { isISBN } from '../../utils/validator'

const app = getApp()
let searchBar // 保存home-search-bar组件的引用

Page({
  data: {
    pageStatus: 'loading', // done, error
    search: {
      focus: false,
      history: [],
    },
    ranking: [],
    recommendBooks: {},
    recommendBooklists: {},
    statistics: {
      book_num: 0,
      page_num: 0,
    },
  },

  onLoad(options) {
    // getStorage的返回值可能是 undefined, 而下面要用
    // search.history.filter 方法，因此默认为空数组
    const tmp = wx.getStorageSync('history')
    this.setData({ 'search.history': tmp || [] })
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onReady() {
    searchBar = this.selectComponent('#searchBar')
  },

  onPullDownRefresh() {
    this._fetchData().then(() => {
      wx.stopPullDownRefresh()
    }).catch(() => {
      wx.stopPullDownRefresh()
    })
  },

  onFocus() {
    this.setData({ 'search.focus': true })
  },

  onCancel() {
    this.setData({ 'search.focus': false })
  },

  onClickHistoryItem(e) {
    showTip('HISTORY').then(() => {
      const value = e.currentTarget.dataset.value
      searchBar.setInputValue(value)
      this._search(searchBar.getSelectedOption(), value)
    })
  },

  onClickTrendingItem(e) {
    this._search('书名', e.currentTarget.dataset.title)
  },

  onSearch(e) {
    this._search(e.detail.type, e.detail.value)
  },

  onClearHistory() {
    wx.showModal({
      title: '清除搜索记录',
      content: '确定清除所有搜索历史？这项操作将无法撤销',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorage({ key: 'history' })
          this.setData({ 'search.history': [] })
        }
      },
    })
  },

  /**
   * 加载页面
   */
  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    return this._fetchData().then(() => {
      this.setData({ pageStatus: 'done' })
    }).catch(() => {
      this.setData({ pageStatus: 'error' })
    })
  },

  /**
   * 搜索图书：设置参数并跳转至图书搜索页
   * @param {string} type   搜索类型
   * @param {string} value  关键字值
   */
  _search(type, value) {
    // 去除前后空白符
    value = value.trim()

    // 保存搜索记录
    this._saveHistory(type, value)

    // 页面跳转
    switch (type) {
      case '书名':
      case '作者':
      case '标签':
        wx.navigateTo({
          url: `/pages/list/book?type=search&search_type=${type}&keyword=${encodeURIComponent(value)}`,
        })
        break
      case 'ISBN':
        if (isISBN(value)) {
          wx.navigateTo({ url: `../book-detail/book-detail?isbn=${value}` })
        }
        else {
          wx.showModal({ content: '请输入正确的13位ISBN', showCancel: false })
        }
        break
      default:
        throw new Error('wrong type: 不支持的搜索类型！')
    }
  },

  /**
   * 获取数据
   */
  _fetchData() {
    return Promise.all([
      getRecommendedBooksByUserId(getUID()),
      getRankingBooks(),
      getRecommendedBooklistsByUserId(getUID()),
      app.getUserInfo(),
    ]).then((res) => {
      this.setData({
        recommendBooks: res[0].data.map(i => i.book),
        ranking: res[1].data.books,
        recommendBooklists: res[2].data,
        statistics: res[3].reading_statistics,
      })
    })
  },

  /**
   * 保存搜索记录，最多保存6个
   * 最新搜索的放在最前面
   */
  _saveHistory(type, value) {
    let history = this.data.search.history.filter(v => v !== value)
    history.unshift(value)
    if (history.length > 6) {
      history = history.slice(0, 6)
    }
    this.setData({ 'search.history': history })
    wx.setStorage({
      key: 'history',
      data: history,
    })
  },
})
