import Promisify from '../../../utils/promisify'

/**
 * 书单页的图书条目
 * @event <change> <modify>
 */
Component({
  properties: {
    // 图书数据
    book: Object,
    // 个性化描述
    comment: String,
    // 是否正在多选书目
    // 关闭多选模式时，重置所有图书条目为未选择状态
    isSelecting: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        if (!newVal) { this.setData({ checked: false }) }
      },
    },
  },

  data: {
    checked: false, // 是否被选中
  },

  methods: {
    _onTapCard() {
      const { isSelecting, checked, book: { id } } = this.data
      if (isSelecting) {
        this.setData({ checked: !checked })
        this.triggerEvent('change', {
          checked: !checked,
        })
      }
      else {
        wx.navigateTo({ url: `/pages/book-detail/book-detail?id=${id}` })
      }
    },

    _onShowActionSheet() {
      Promisify(wx.showActionSheet)({
        itemList: ['编辑图书描述'],
        itemColor: '#000',
      }).then((res) => {
        this.triggerEvent('modify')
      })
    },
  },
})
