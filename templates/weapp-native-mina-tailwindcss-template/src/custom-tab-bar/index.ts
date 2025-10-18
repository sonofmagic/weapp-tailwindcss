Component({
  data: {
    selected: 0,
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    list: [
      {
        pagePath: '/pages/index/index',
        iconPath: '/images/icon_component.png',
        selectedIconPath: '/images/icon_component_HL.png',
        text: '页面',
      },
      {
        pagePath: '/pages/logs/logs',
        iconPath: '/images/icon_API.png',
        selectedIconPath: '/images/icon_API_HL.png',
        text: '接口',
      },
    ],
  },
  methods: {
    switchTab(e: WechatMiniprogram.CustomEvent) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({ url })
      this.setData({
        selected: data.index,
      })
    },
  },
})
