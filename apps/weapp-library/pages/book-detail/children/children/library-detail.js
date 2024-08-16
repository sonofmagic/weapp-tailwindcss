import { getLibraryById } from '../../../../apis/library'

let options // 保存页面参数

Page({
  data: {
    pageStatus: 'loading', // error, done
    library: {
      id: undefined,
      status: 1, // 0：未认证，1：已认证
      name: '',
      phone: '',
      address: '',
      introduction: '',
      book_type_num: 0,
      book_total_num: 0,
      photos: [],
    },
  },

  onLoad(opts) {
    options = opts
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onPreview(e) {
    const library = this.data.library
    const id = e.currentTarget.dataset.index
    wx.previewImage({
      current: library.photos[id],
      urls: library.photos,
    })
  },

  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    getLibraryById(options.id).then((res) => {
      this.setData({
        library: res.data,
        pageStatus: 'done',
      })
    }).catch(() => this.setData({ pageStatus: 'error' }))
  },
})
