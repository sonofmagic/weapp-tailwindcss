const appInstance = getApp();

Component({
  data: {
    selected: 0,
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
      },
      {
        pagePath: '/pages/issue/case55',
        text: 'case55',
      },
    ],
  },
  attached() {},
  methods: {
    async switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      console.log(data, appInstance.globalData);
      await wx.switchTab({ url });

      const tabBar = this.getTabBar();
      [this, tabBar].forEach((x) => {
        x.setData({
          selected: data.index,
        });
      });
    },
  },
});
