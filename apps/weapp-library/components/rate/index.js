/**
 * 可打半星的评分组件，默认满分10分
 * @event <change>
 */
Component({
  properties: {
    // 当前评分
    value: Number,
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false,
    },
    // 五角星个数
    number: {
      type: Number,
      value: 5,
    },
    // 五角星大小
    starSize: {
      type: String,
      value: 30,
    },
    // 五角星间距大小
    gutterSize: {
      type: Number,
      value: 0,
    },
    // 大小单位：px，rpx
    unit: {
      type: String,
      value: 'px',
    },
  },

  data: {
    // 满星、半星、空星图片url
    fullSrc: './images/icon_star_full.png',
    halfSrc: './images/icon_star_half.png',
    normalSrc: './images/icon_star_normal.png',

    // wx-for 中的辅助数组，为每颗星星设置 value
    starArray: [],
  },

  attached() {
    let t = 0
    const ta = []
    for (let i = 0; i < this.properties.number; i++, t += 2) {
      ta.push(t)
    }
    this.setData({ starArray: ta })
  },

  methods: {
    // 点击左边选择半颗星
    _onTapLeft(e) {
      if (this.data.disabled) { return }
      let value = e.currentTarget.dataset.value
      if (this.data.value === value) {
        value--
      }
      this.setData({ value })
      this.triggerEvent('change', { value })
    },

    // 点击右边选择整颗星
    _onTapRight(e) {
      if (this.data.disabled) { return }
      let value = e.currentTarget.dataset.value
      if (this.data.value === value) {
        value--
      }
      this.setData({ value })
      this.triggerEvent('change', { value })
    },
  },
})
