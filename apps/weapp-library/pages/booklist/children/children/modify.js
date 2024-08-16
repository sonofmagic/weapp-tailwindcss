import { updateBooklistById } from '../../../../apis/booklist'

let NB_TIMER

// 保存页面参数options
let options = {
  index: undefined,
  book_id: undefined,
  booklist_id: undefined,
}

Page({
  data: {
    comment: '',
  },

  onLoad(opts) {
    options = opts
    this.setData({ comment: decodeURIComponent(opts.comment) })
  },

  onUnload() {
    clearTimeout(NB_TIMER)
  },

  onInput(e) {
    this.setData({ comment: e.detail.value })
  },

  /**
   * @event <bookDescriptionModified>
   * 书单详情页(../booklist-detail)监听该事件
   */
  onSubmit() {
    wx.showLoading({ title: '加载中', mask: true })
    updateBooklistById(options.booklist_id, {
      add_items: [
        {
          book_id: options.book_id,
          comment: this.data.comment,
        },
      ],
    }).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '操作成功', mask: true })
      NB_TIMER = setTimeout(_ => wx.navigateBack(), 1000)

      // 触发事件
      getApp().event.emit('bookCommentModified', {
        index: options.index,
        comment: this.data.comment,
      })
    }).catch((_) => {
      wx.hideLoading()
    })
  },
})
