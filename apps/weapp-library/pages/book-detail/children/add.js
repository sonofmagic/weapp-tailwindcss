import { getBooklistsByUserId, updateBooklistById } from '../../../apis/booklist'
import { showTip } from '../../../utils/tip'
import { getUID } from '../../../utils/permission'

let NB_TIMER

Page({
  data: {
    // 图书 id
    id: undefined,
    // 图书描述
    comment: '',
    // 用户创建的书单列表
    booklists: [],
    // 书单标题列表，用于选择器
    booklistTitles: [],
    // 选择的书单下标
    selectedIndex: 0,
  },

  onLoad(options) {
    this.data.id = options.id
    showTip('ADD_TO_BOOKLIST')
  },

  onUnload() {
    clearTimeout(NB_TIMER)
  },

  // 从创建书单页返回时刷新书单列表
  onShow() {
    wx.showLoading({ title: '加载中', mask: true })
    getBooklistsByUserId(getUID(), 'create').then((res) => {
      if (res.data.create && res.data.create.length) {
        const tmp = res.data.create
        this.setData({
          booklists: tmp,
          booklistTitles: tmp.map(e => e.title),
        })
      }
      else {
        wx.showModal({
          title: '创建书单',
          content: '您还没有创建书单，是否现在创建一个书单？',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({ url: '/pages/booklist/children/modify?action=create' })
            }
            else {
              wx.navigateBack()
            }
          },
        })
      }
    }).finally(() => wx.hideLoading())
  },

  onSelect(e) {
    this.setData({ selectedIndex: e.detail.value })
  },

  onInput(e) {
    this.setData({ comment: e.detail.value })
  },

  onSubmit() {
    const { id, booklists, selectedIndex, comment } = this.data
    wx.showLoading({ title: '加载中', mask: true })
    updateBooklistById(booklists[selectedIndex].id, {
      add_items: [
        { book_id: id, comment },
      ],
    }).then((_) => {
      wx.showToast({ title: '操作成功', mask: true })
      NB_TIMER = setTimeout(() => wx.navigateBack(), 1000) // 直接后退时当前页面的 toast 会立刻消失
    })
  },
})
