//app.js

// import { range } from 'rxjs'
// import { map, filter } from 'rxjs/operators'
import bus from './bus'
//import { camelCase } from 'lodash'
//import dayjs from 'dayjs'

// range(1, 200)
//   .pipe(
//     filter(x => x % 2 === 1),
//     map(x => x + x),
//   )
//   .subscribe(x => console.log(x))
// typeof Page



const nativeNavigateTo = wx.navigateTo

function checkToken() {
  return Boolean(wx.getStorageSync('token'))
}
// readonly field hijack
wx = {
  ...wx,
  navigateTo: function (options: Parameters<typeof wx.navigateTo>[0]) {
    if (checkToken()) {
      return nativeNavigateTo(options) as ReturnType<typeof wx.navigateTo>
    } else {
      throw new Error('auth error')
    }
  }
}
// common field hijack
const nativePage = Page
Page = function (options: Parameters<typeof Page>[0]) {
  if (options.onLoad && typeof options.onLoad === 'function') {
    const originalOnLoad = options.onLoad
    options.onLoad = async function (params: Record<string, any>) {
      await bus.promise
      originalOnLoad.call(this, params)
    }
  }
  nativePage(options)
}



App({
  onLaunch: function () {
    console.log(`环境：${process.env.NODE_ENV} 构建类型：${process.env.BUILD_TYPE}`)

    console.log('-----------------------------------------------')
    //console.log(camelCase('OnLaunch'))

    //let sFromNowText = dayjs(new Date().getTime() - 360000).fromNow()
    //console.log(sFromNowText)

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      },
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            },
          })
        }
      },
    })

    bus.promise = new Promise(resolve => {
      setTimeout(() => {
        console.log('App Launch and get token')
        resolve(undefined)
      }, 1000)
    })
  },
  globalData: {
    userInfo: null,
  },
})
