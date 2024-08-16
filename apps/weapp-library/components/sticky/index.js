/**
 * Sticky 吸顶元素，当元素滚动到页面顶部时固定，不再跟随滚动。
 * @event <stickystart> <stickyend> 事件对象为被包裹元素的布局信息
 *
 * 使用示例
 * ① wxml:
  <sticky scroll-top="{{ scrollTop }}">
    <view>我是固定的！</view>
    <view slot="sticky">我是固定的！</view>
  </sticky>
 * ② 为页面添加属性 scrollTop: 0
 * ③ 在页面的onPageScroll或scroll-view的bindscroll事件中添加：
  onPageScroll: function (e) {
    this.setData({scrollTop: e.scrollTop})
  }
 */
Component({
  properties: {
    // 页面scrollTop值，该值发生变化时说明页面发生了滚动
    scrollTop: {
      type: Number,
      observer(val) {
        this._update()
      },
    },
    // 固定位置与顶部的距离
    topSpacing: {
      type: Number,
      value: 0,
    },
  },
  options: {
    multipleSlots: true,
  },
  data: {
    fixed: false,
  },

  methods: {
    _update() {
      const query = wx.createSelectorQuery().in(this)
      query.select('.sticky').boundingClientRect((res) => {
        const fixed = res.top - this.properties.topSpacing < 0
        if (fixed == this.data.fixed) { return }
        this.setData({ fixed })
        if (fixed) {
          this.triggerEvent('stickystart', res)
          console.log('trigger stickystart')
        }
        else {
          this.triggerEvent('stickyend', res)
          console.log('trigger stickyend')
        }
      }).exec()
    },
  },
})
