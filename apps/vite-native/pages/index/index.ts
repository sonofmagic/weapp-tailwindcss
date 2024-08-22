// index.js
// import { formatTime } from '../../utils/util'

// const { formatTime } = require('../../utils/util')
import { formatTime } from '../../utils/util'

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
Page({
  data: {
    motto: JSON.stringify(import.meta.env, null, 2),
    message: 'Hello MINA!',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    array: [1, 2, 3, 4, 5],
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    time: formatTime(new Date()),
    staffA: { firstName: 'Hulk', lastName: 'Hu' },
    staffB: { firstName: 'Shang', lastName: 'You' },
    staffC: { firstName: 'Gideon', lastName: 'Lin' },
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      'userInfo.avatarUrl': avatarUrl,
      'hasUserInfo': nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      'userInfo.nickName': nickName,
      'hasUserInfo': nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
      },
    })
  },
})
