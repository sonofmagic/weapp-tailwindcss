import { showTip } from '../../../utils/tip'
import { addReviewByBookId, deleteReviewById, getReviewsByBookId } from '../../../apis/review'
import { getUID } from '../../../utils/permission'

let toptip // 保存toptip组件的引用
let once = false // 帮助消息只提醒一次

Page({
  data: {
    // 页面加载状态
    pageStatus: 'loading', // error, done
    // 是否展示图书信息: 从“我的书评”跳转过来时展示
    showBookInfo: false,
    // 图书id
    id: undefined,
    // 图书信息
    book: {},
    // 评论列表
    reviews: [],
    // popup组件数据
    popup: {
      show: false,
      score: 0, // 评分
      content: '', // 评论文本
      label: [
        '点击星星评分',
        '很差',
        '很差',
        '较差',
        '较差',
        '还行',
        '还行',
        '推荐',
        '推荐',
        '力荐',
        '力荐',
      ],
      loading: false, // 按钮加载状态
    },
    // load-more组件状态：hidding, loading, nomore
    loadMoreStatus: 'hidding',
    scrollTop: 0,
  },

  onLoad(options) {
    this.setData({
      id: options.id,
      showBookInfo: !!options.show_book_info,
    })
    toptip = this.selectComponent('#toptip')
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onPageScroll(e) {
    this.setData({ scrollTop: e.scrollTop })
  },

  onReachBottom() {
    const status = this.data.loadMoreStatus
    if (status !== 'hidding') { return }

    const { id, reviews } = this.data
    this.setData({ loadMoreStatus: 'loading' })
    getReviewsByBookId(id, reviews.length).then((res) => {
      if (res.data.reviews.length) {
        this.setData({
          reviews: reviews.concat(res.data.reviews),
          loadMoreStatus: 'hidding',
        })
      }
      else {
        this.setData({ loadMoreStatus: 'nomore' })
      }
    }).catch(() => this.setData({ loadMoreStatus: 'hidding' }))
  },

  onChange(e) {
    this.setData({ 'popup.score': e.detail.value })
  },

  /**
   * 点击<page-empty>模板的操作按钮
   */
  onTapPageEmptyBtn() {
    this.onShowPopup()
  },

  onShowPopup() {
    this.setData({ 'popup.show': true })
    if (!once) {
      once = true
      showTip('ADD_REVIEW')
    }
  },

  onHidePopup() {
    this.setData({ 'popup.show': false })
  },

  onInput(e) {
    this.setData({ 'popup.content': e.detail.value })
  },

  onDelete(e) {
    const { id, index } = e.currentTarget.dataset
    wx.showModal({
      title: '删除评论',
      content: '确定删除这条评论？这项操作将无法撤销',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中', mask: true })
          deleteReviewById(id).then(() => {
            wx.hideLoading()
            this.data.reviews.splice(index, 1)
            this.setData({ reviews: this.data.reviews })
            wx.showToast({ title: '删除成功' })
          }).catch(() => wx.hideLoading())
        }
      },
    })
  },

  onSubmit() {
    const { id, reviews } = this.data
    const { score, content, loading } = this.data.popup
    const wechat_user_id = getUID()

    if (loading) { return }
    if (!score) { return toptip.show('请点击星星评分') }
    if (!content) { return toptip.show('请输入评论') }

    this.setData({ 'popup.loading': true })
    addReviewByBookId(id, { score, content, wechat_user_id }).then((res) => {
      wx.showToast({ title: '操作成功' })
      this.setData({
        // 清空输入框
        'popup.loading': false,
        'popup.show': false,
        'popup.score': 0,
        'popup.content': '',
        'reviews': [res.data, ...reviews],
      })
    }).finally(() => this.setData({ 'popup.loading': false }))
  },

  /**
   * 加载页面
   */
  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    const { id } = this.data
    getReviewsByBookId(id).then((res) => {
      this.setData({
        reviews: res.data.reviews,
        pageStatus: 'done',
        book: res.data.book,
      })
    }).catch(() => {
      this.setData({ pageStatus: 'error' })
    })
  },
})
