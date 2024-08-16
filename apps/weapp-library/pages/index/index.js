import { isLogin } from '../../utils/permission'

/**
 * 判断登录状态并跳转
 */
Page({
  onLoad() {
    if (isLogin()) {
      wx.switchTab({ url: '/pages/home/home' })
    }
    else {
      wx.redirectTo({ url: '/pages/register/register' })
    }
  },
})
