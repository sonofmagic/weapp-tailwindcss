// import { ComponentWithComputed } from 'miniprogram-computed';
// const computedBehavior = require('miniprogram-computed').behavior;
const appInstance = getApp();
Component({
  behaviors: [],
  data: {
    selected: appInstance.globalData.selected,
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    list: appInstance.globalData.list,
    visible: appInstance.globalData.tabbarVisible,
  },
  // observers: {
  //   'globalData.**': function (val) {
  //     console.log(val);
  //   },
  // },
  lifetimes: {
    attached() {
      this.watcher = getApp().globalData.watch((v) => {
        this.setData({
          visible: v.tabbarVisible,
        });
      });
      this.setData({
        selected: getApp().globalData.selected,
      });
    },
    created() {},
  },

  // computed: {
  //   list() {
  //     return appInstance.globalData.list;
  //   },
  // },
  methods: {
    async switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;

      await wx.switchTab({ url });
      // this.setData({
      //   selected: data.index,
      // });
      // this.getTabBar().setData({
      //   selected: data.index,
      // });
      getApp().globalData.selected = data.index;
    },
  },
});
