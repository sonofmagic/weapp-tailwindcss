import Promise from './utils/es6-promise'
import './utils/promise-polyfill' // 添加 promise.finally
import { initTipSettings } from './utils/tip' // 使用帮助
import EventEmitter from './utils/event' // 事件总线
import { getUserInfoById } from './apis/user' // 获取用户信息
import { autoLogin, getUID } from './utils/permission'

// fundebug 错误监控
const fundebug = require('/utils/fundebug.0.5.0.min.js')

fundebug.apikey = '这里要填写成你的key'
fundebug.setSystemInfo = true
fundebug.releaseStage = 'production'

App({
  /**
   * 全局事件总线
   */
  event: new EventEmitter(),

  onLaunch() {
    // 自动登录
    autoLogin()

    // 初始化帮助信息
    initTipSettings()
  },

  /**
   * 获取用户信息
   * @return {Promise}
   */
  getUserInfo() {
    const uid = getUID()
    if (!uid) {
      return Promise.reject(new Error('未登录'))
    }
    // 已经有用户信息时直接返回
    if (USER_INFO.id) {
      return Promise.resolve(USER_INFO)
    }
    return getUserInfoById(uid).then((res) => {
      this.setUserInfo(res.data)
      return res.data
    })
  },

  /**
   * 设置用户信息
   * @event <userInfoChanged> 在个人信息页(personal-information)被监听
   */
  setUserInfo(userInfo) {
    USER_INFO = Object.assign({}, USER_INFO, userInfo)
    this.event.emit('userInfoChanged', { userInfo })
  },
})

/**
 * 用户完整信息，只能通过getter和setter访问和修改
 */
var USER_INFO = {
  id: null, // 用户id
  phone: '', // 手机号
  openid: '', // openid
  status: 0, // 账号状态：0~3 未审核、已通过、未通过、已拉黑
  review_msg: '', //  管理员驳回资质审核材料时给图书馆的简短说明
  nickname: '', // 昵称
  avatar: '', // 头像链接
  name: '', // 真实姓名
  birthday: '', // 出生日期
  id_number: '', // 身份证号码
  id_card_img: { // 身份证图片链接
    front: '', // 身份证正面
    back: '', // 身份证反面
  },
  address: '', // 地址
  postcode: '', // 邮编
  deposit_status: 0, // 押金状态：0~2 未支付、已支付、已退还
  reading_statistics: { // 阅读统计
    book_num: 0, // 读了几本书
    page_num: 0, // 读了多少页
  },
}
