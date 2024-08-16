/**
 * 帮助信息
 */

import Promisify from './promisify'

/**
 * 帮助信息配置
 * 应用启动时从缓存中初始化，只能通过下面的 setter 修改
 */
let TIP_SETTINGS = {
  // 扫描二维码搜索图书
  SEARCH_SCAN: {
    show: true,
    message: '手动输入ISBN太麻烦？您可以点击输入框右侧的扫描图标，直接扫描图书条形码',
  },
  // 搜索历史记录
  HISTORY: {
    show: true,
    message: '搜索历史会保留搜索类型与关键字，最多保留六条历史记录',
  },
  // 加入书单
  ADD_TO_BOOKLIST: {
    show: true,
    message: '您的书单可以被其他用户收藏，您可以为书单内的每一本图书设置个性化描述',
  },
  // 创建书单
  CREATE_BOOKLIST: {
    show: true,
    message: '您的书单可以被其他用户收藏，您可以为书单内的每一本图书设置个性化描述',
  },
  // 添加评论
  ADD_REVIEW: {
    show: true,
    message: '为喜欢的图书多打几颗星吧，评价的图书越多，系统推荐的内容就越精准',
  },
  // 我的评论
  MY_REVIEWS: {
    show: true,
    message: '点击评论可以跳转到图书评论页',
  },
}

/**
 * 显示使用帮助
 * @param type {string}
 * @return {Promise}
 */
function showTip(type) {
  if (TIP_SETTINGS[type].show) {
    return Promisify(wx.showModal)({
      title: '帮助',
      content: TIP_SETTINGS[type].message,
      cancelText: '关闭',
      confirmText: '不再显示',
    }).then((res) => {
      if (res.confirm) {
        setTipSettingByType(type, false)
      }
    })
  }
  else {
    return Promise.resolve()
  }
}

/**
 * 设置整个 TIP_SETTINGS
 */
function setTipSettings(obj) {
  TIP_SETTINGS = obj
  wx.setStorageSync('TIP_SETTINGS', TIP_SETTINGS)
}

/**
 * 设置某一项使用帮助的显示
 */
function setTipSettingByType(type, show) {
  TIP_SETTINGS[type].show = show
  wx.setStorageSync('TIP_SETTINGS', TIP_SETTINGS)
}

/**
 * 从本地缓存中初始化 TIP_SETTINGS
 */
function initTipSettings() {
  const tmp = wx.getStorageSync('TIP_SETTINGS')
  if (tmp) {
    setTipSettings(tmp)
  }
}

module.exports = {
  setTipSettings,
  setTipSettingByType,
  showTip,
  initTipSettings,
}
