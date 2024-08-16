import { getBooksByAdvancedSearch, getBooksByAuthor, getBooksByClassificationNumber, getBooksByKeyword, getBooksByTag, getRankingBooks, getRecommendedBooksByUserId } from '../../apis/book'
import { getUID } from '../../utils/permission'

const options = {} // 保存 options 参数

Page({
  data: {
    type: {},
    books: [],
    comments: [], // 推荐图书的描述
    loadMoreStatus: 'hidding', // loading, nomore
    isNoData: false, // 是否没有数据
  },

  onLoad(opt) {
    Object.keys(opt).forEach((key) => {
      options[key] = decodeURIComponent(opt[key])
    })
    this.setData({ type: options.type })
    switch (options.type) {
      case 'search':
      case 'advanced_search':
      case 'classify_search':
        wx.setNavigationBarTitle({ title: '搜索结果' })
        break
      case 'recommend':
        wx.setNavigationBarTitle({ title: '推荐图书' })
        break
      case 'ranking':
        wx.setNavigationBarTitle({ title: '近期热门图书' })
        break
    }

    wx.showLoading({ title: '加载中', mask: true })
    this._fetchData().then((books) => {
      // 第一次加载数据时判断是否“暂无数据”
      if (!books.length) {
        this.setData({ isNoData: true })
      }
    }).finally(() => wx.hideLoading())
  },

  onReachBottom() {
    const { loadMoreStatus, isNoData } = this.data

    // 推荐图书一次性即可加载完毕，不再加载
    if (loadMoreStatus !== 'hidding' || isNoData || options.type === 'recommend') { return }

    this.setData({ loadMoreStatus: 'loading' })
    this._fetchData(this.data.books.length).then((books) => {
      !books.length || options.type === 'recommend'
        ? this.setData({ loadMoreStatus: 'nomore' })
        : this.setData({ loadMoreStatus: 'hidding' })
    }).catch(() => this.setData({ loadMoreStatus: 'hidding' }))
  },

  /**
   * 获取图书数据
   * @param start {Integer} 搜索偏移量
   */
  _fetchData(start = 0) {
    let fn
    switch (options.type) {
      case 'search':
        if (options.search_type === '书名') {
          fn = getBooksByKeyword(options.keyword, start)
        }
        else if (options.search_type === '作者') {
          fn = getBooksByAuthor(options.keyword, start)
        }
        else if (options.search_type === '标签') {
          fn = getBooksByTag(options.keyword, start)
        }
        break
      case 'advanced_search':
        options.start = start
        fn = getBooksByAdvancedSearch(options)
        break
      case 'classify_search':
        fn = getBooksByClassificationNumber(options.class_num, start)
        break
      case 'recommend':
        fn = getRecommendedBooksByUserId(getUID())
        break
      case 'ranking':
        fn = getRankingBooks(start)
        break
      default:
        throw new Error('不支持的搜索类型！')
    }

    return fn.then((res) => {
      let books
      if (options.type === 'recommend') {
        /* 推荐图书接口的返回值为
         * {
         *   books: [{
         *     book: Book,
         *     comment: String
         *   }],
         *   total: Integer
         * }
         */
        books = res.data.map(e => e.book)
        this.setData({
          books,
          comments: res.data.map(e => e.comment),
        })
      }
      else {
        /* 其他接口的返回值为
         * {
         *   books: [Book],
         *   total: Integer
         * }
         */
        books = res.data.books
        this.setData({
          books: this.data.books.concat(res.data.books),
        })
      }
      return books
    }).catch(() => {
      return []
    })
  },
})
