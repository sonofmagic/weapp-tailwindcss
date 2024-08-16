import Promisify from '../../utils/promisify'
import { updateUserInfoById } from '../../apis/user'
import { getUID, logout } from '../../utils/permission'

const app = getApp()

Page({
  data: {
    showLoginBtn: false,
  },

  onLoad() {
    // 获取用户授权，更新用户昵称与头像
    Promisify(wx.getUserInfo)()
      .then(this._updateUserInfo)
      .catch(() => this.setData({ showLoginBtn: true }))
  },

  onLogout() {
    wx.showModal({
      content: '确定退出登录？',
      success: (res) => {
        if (res.confirm && logout()) {
          wx.reLaunch({ url: '/pages/register/register' })
        }
      },
    })
  },

  onClickLoginBtn(e) {
    const { errMsg } = e.detail
    if (!errMsg.includes('fail')) {
      this._updateUserInfo(e.detail).then(() => {
        this.setData({ showLoginBtn: false })
      })
      wx.showToast({ title: '授权成功' })
    }
  },

  _updateUserInfo(userInfo) {
    return updateUserInfoById(getUID(), {
      nickname: userInfo.userInfo.nickName,
      avatar: userInfo.userInfo.avatarUrl,
    }).then(res => app.setUserInfo(res))
  },
})
