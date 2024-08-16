/**
 * 这种实现方式有一个问题是获取位置信息很慢，平均1000ms，
 * 过渡的时候有一个很长的卡顿。暂时还没找到解决办法。
 */

import { debounce } from '../../utils/utils'

let SYNC_ID = 0 // 获取元素信息为异步获取，因此用一个变量记录最后一次调用的方法的id

/**
 * 当元素滚动到页面顶部时固定，不再跟随滚动。
 * @event <stickystart> <stickyend> 事件对象为被包裹元素的布局信息
 *
 * 使用示例
 * ① wxml:
  <sticky scroll-top="{{ scrollTop }}">
    <view>我是固定的！</view>
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
  },

  data: {
    isSticky: false,
    wrapperHeight: 0,
  },

  methods: {
    _update: debounce(function () {
      const TEMP_ID = ++SYNC_ID // 记录当前id

      console.log(TEMP_ID)
      const time = Date.now()

      this.createSelectorQuery()
        .selectAll('.sticky--selected')
        .fields({
          rect: true,
          size: true,
        },
        /**
         * @param nodesRef 元素布局信息数组，第一个是外部元素的信息，第二个是被包裹元素的信息
         * { left, right, top, bottom, width, height }
         */
        (nodesRef) => {
          if (TEMP_ID !== SYNC_ID) { return }

          nodesRef[0].height = nodesRef[1].height = 64
          const { isSticky } = this.data
          const { top: outTop, height: outHeight } = nodesRef[0] // 外部wrapper信息
          const { top: stickyTop, height: stickyHeight } = nodesRef[1] // 被包裹元素信息

          console.log('获取元素位置信息用时', Date.now() - time)

          if (!isSticky && stickyTop < 0) {
            this.setData({
              isSticky: true,
              wrapperHeight: outHeight,
            })
            this.triggerEvent('stickystart', nodesRef[1])
            console.log('trigger stickystart')
          }
          else if (isSticky && outTop + outHeight >= stickyTop + stickyHeight) {
            this.setData({
              isSticky: false,
            })
            this.triggerEvent('stickyend', nodesRef[1])
            console.log('trigger stickyend')
          }
        }).exec()
    }, 100),
  },
})
