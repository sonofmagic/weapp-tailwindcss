import { getBookByISBN, getBookById, getCollectionsByBookISBN } from '../../apis/book'
import { getCollectionsByBookId } from '../../apis/collection'
import { isLogin } from '../../utils/permission'

let options // 保存页面参数

Page({
  data: {
    /**
     * 页面状态
     * loading：加载中
     * error：获取数据失败
     * done：成功，显示图书信息
     * nodata：数据库无该图书信息，显示创建条目提示
     */
    pageStatus: 'loading',
    // 图书信息
    book: {},
    // 图书馆列表
    libraryList: {
      show: false,
      status: 'loading', // loading, nodata, done
      data: [],
    },
  },

  onLoad(opts) {
    options = opts
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onShowTip() {
    wx.showModal({
      title: '参与贡献',
      content: `您可访问 https://www.xxxxxx.cn/wiki/#/book/${this.data.book.id} 编辑本页内容`,
      showCancel: false,
    })
  },

  onPreview() {
    const img = this.data.book.imgs.small
    wx.previewImage({
      current: img,
      urls: [img],
    })
  },

  onShowPopup() {
    this.setData({ 'libraryList.show': true })
  },

  onHidePopup() {
    this.setData({ 'libraryList.show': false })
  },

  /**
   * 跳转页面前判断是否登录，如果没有登录，显示登录对话框
   */
  onNavigate(e) {
    if (!isLogin(true)) { return }

    const target = e.currentTarget.dataset.target
    const libraryId = e.currentTarget.dataset.id
    const bookId = this.data.book.id
    let url
    switch (target) {
      case 'add':
        url = `./children/add?id=${bookId}`
        break
      case 'review':
        url = `./children/review?id=${bookId}`
        break
      case 'libraryItem':
        url = `./children/order?book_id=${bookId}&library_id=${libraryId}`
        break
      case 'libraryList':
        url = `./children/library-list?id=${bookId}`
        break
    }
    wx.navigateTo({ url })
  },

  onShareAppMessage() {
    return {
      title: '向你分享图书',
      desc: this.data.book.title,
      path: `/pages/book-detail/book-detail?id=${this.data.book.id}`,
    }
  },

  /**
   * 点击<page-empty>模板的操作按钮
   */
  onTapPageEmptyBtn() {
    throw new Error('点击事件未实现')
  },

  /**
   * 加载页面
   */
  _loadPage() {
    this._getBook().then(() => this._getCollections())
  },

  /**
   * 根据 id 或根据 isbn 获取图书信息
   */
  _getBook() {
    this.setData({ pageStatus: 'loading' })
    const fn = options.id
      ? getBookById(options.id)
      : getBookByISBN(options.isbn)
    return fn.then((res) => {
      this.setData({
        book: res.data,
        pageStatus: 'done',
      })
    }).catch((res) => {
      this.setData({
        pageStatus: res.statusCode === 404 ? 'nodata' : 'error',
      })
      return Promise.reject(new Error('图书不存在'))
    })
  },

  /**
   * 根据 id 或根据 isbn 获取图书馆藏信息
   */
  _getCollections() {
    const fn = options.id
      ? getCollectionsByBookId(options.id)
      : getCollectionsByBookISBN(options.isbn)
    return fn.then(res =>
      this.setData({
        'libraryList.status': res.data.collections.length ? 'done' : 'nodata',
        'libraryList.data': res.data.collections,
      }),
    ).catch(() => this.setData({ 'libraryList.status': 'nodata' }))
  },
})
