import { deleteReviewById, getReviewsByUserId } from '../../../apis/review'
import { getUID } from '../../../utils/permission'
import { showTip } from '../../../utils/tip'

Page({
  data: {
    pageStatus: 'loading', // error, done
    reviews: [],
    loadMoreStatus: 'hidding', // loading, nomore
  },

  onLoad(options) {
    showTip('MY_REVIEWS')
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onReachBottom() {
    const status = this.data.loadMoreStatus
    if (status !== 'hidding') { return }

    this.setData({ loadMoreStatus: 'loading' })
    const reviews = this.data.reviews
    getReviewsByUserId(getUID(), reviews.length).then((res) => {
      this.setData({
        reviews: reviews.concat(res.data.reviews),
        loadMoreStatus: res.data.reviews.length ? 'hidding' : 'nomore',
      })
    }).catch(() => this.setData({ loadMoreStatus: 'hidding' }))
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

  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    getReviewsByUserId(getUID()).then((res) => {
      this.setData({
        pageStatus: 'done',
        reviews: res.data.reviews,
      })
    }).catch(() => this.setData({ pageStatus: 'error' }))
  },
})
