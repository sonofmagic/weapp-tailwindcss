import { defineComponent, reactive, ref } from 'wevu'

const defaultAvatarUrl =
  'https://mmbiz.qpic.cn/mmbiz/vi_32/Q0j4TwGTfTJLTpJ5dD6Y3vR0pu2Lx5D3w1lUwLrZ7NCyKz1q8I4xA86c1k3apwFVB9C7bPBCn2iYg4JibL0z0icA/0'

interface UserInfo {
  nickName: string
  avatarUrl: string
}

export default defineComponent({
  setup() {
    const motto = ref('Hello World')
    const userInfo = reactive<UserInfo>({
      nickName: '',
      avatarUrl: defaultAvatarUrl,
    })
    const hasUserInfo = ref(false)
    const canIUseGetUserProfile = wx.canIUse('getUserProfile')
    const canIUseNicknameComp = wx.canIUse('input.type.nickname')
    const skylineNav = reactive({
      title: 'Skyline Market',
      location: '深圳 · 夜景塔群',
      weather: '晴 · 26°C',
      trend: [48, 76, 58, 102, 96, 132, 118] as number[],
    })

    function syncHasUserInfo() {
      hasUserInfo.value = Boolean(
        userInfo.nickName
          && userInfo.avatarUrl
          && userInfo.avatarUrl !== defaultAvatarUrl,
      )
    }

    function bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    }

    function onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      userInfo.avatarUrl = avatarUrl
      syncHasUserInfo()
    }

    function onInputChange(e: any) {
      userInfo.nickName = e.detail.value
      syncHasUserInfo()
    }

    function handleNavAction() {
      wx.showToast({
        title: '更多趋势即将上线',
        icon: 'none',
      })
    }

    function getUserProfile() {
      wx.getUserProfile({
        desc: '展示用户信息',
        success: (res) => {
          console.log(res)
          Object.assign(userInfo, res.userInfo)
          syncHasUserInfo()
        },
      })
    }

    return {
      motto,
      userInfo,
      hasUserInfo,
      canIUseGetUserProfile,
      canIUseNicknameComp,
      skylineNav,
      bindViewTap,
      onChooseAvatar,
      onInputChange,
      handleNavAction,
      getUserProfile,
    }
  },
})
