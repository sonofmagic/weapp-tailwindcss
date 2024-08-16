import { USER_STATUS_APPROVED, USER_STATUS_REJECTED, USER_STATUS_REVIEWING } from '../../../utils/constant'

const app = getApp()

Page({
  data: {
    userInfo: {
      status: undefined, // 0: 未审核 1: 已通过 2: 未通过 3: 已拉黑
      name: '',
      birthday: '',
      id_number: '',
      postcode: '',
      address: '',
      id_card_img: {
        front: '',
        back: '',
      },
    },
    tips: '',
  },

  /**
   * @listens <userInfoChanged> app.setUserInfo 调用时触发
   */
  onLoad() {
    wx.showLoading({ title: '加载中', mask: true })
    this._setUserInfo().finally(() => wx.hideLoading())

    // 监听事件
    app.event.on('userInfoChanged', this._setUserInfo)
  },

  onPreview(e) {
    const { front, back } = this.data.userInfo.id_card_img
    const type = e.currentTarget.dataset.type
    wx.previewImage({
      // 当前显示图片的http链接
      current: this.data.userInfo.id_card_img[type],
      // 需要预览的图片http链接列表，filter过滤空url
      urls: [front, back].filter(e => e),
    })
  },

  _setUserInfo() {
    return app.getUserInfo().then((userInfo) => {
      this.setData({ userInfo })
      if (userInfo.status === USER_STATUS_REVIEWING) {
        this.setData({
          tips: '您的信息正在审核中，在此期间您可以重新设置您的个人信息，审核通过后您将可以在线预约图书。',
        })
      }
      else if (userInfo.status === USER_STATUS_APPROVED) {
        this.setData({
          tips: '您的信息已通过审核，您现在可以在线预约图书。如果您需要修改个人信息，请通过“意见反馈”联系管理员。',
        })
      }
      else if (userInfo.status === USER_STATUS_REJECTED) {
        this.setData({
          tips: `您的信息没有通过审核，原因是：${userInfo.review_msg}。您可修改后重新提交审核，审核通过后您将可以在线预约图书。`,
        })
      }
    })
  },
})
