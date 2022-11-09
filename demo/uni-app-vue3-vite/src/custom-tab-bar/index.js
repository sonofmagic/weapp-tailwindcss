// import { ComponentWithComputed } from 'miniprogram-computed';
// const computedBehavior = require('miniprogram-computed').behavior;
const appInstance = getApp();
Component({
  behaviors: [],
  data: {
    selected: 0,
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    list: appInstance.globalData.list,
  },
  attached() {},
  // computed: {
  //   list() {
  //     return appInstance.globalData.list;
  //   },
  // },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.switchTab({ url });
      this.setData({
        selected: data.index,
      });

      // const tabBar = this.getTabBar();
      // [this, tabBar].forEach((x) => {
      //   x.setData({
      //     selected: data.index,
      //   });
      // });
      // appInstance.globalData.selected = data.index;
      // tabBar.setData({
      //   selected: data.index,
      // });
    },
  },
});
