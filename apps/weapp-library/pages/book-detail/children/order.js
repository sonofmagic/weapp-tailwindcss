import { dateAdd, formatDate } from '../../../utils/utils'
import { getCollectionsByBookId } from '../../../apis/collection'
import { createOrders } from '../../../apis/order'
import { getUID } from '../../../utils/permission'
import { ORDER_STATUS_WAITING_FOR_OTHERS_TO_RETURN, ORDER_STATUS_WAITING_TO_TAKE_AT_PLANED_TIME } from '../../../utils/constant'

let options // 保存页面参数

Page({
  data: {
    // 页面加载状态
    pageStatus: 'loading', // error, done
    // 图书信息
    book: {},
    // 图书馆信息
    library: {},
    // 馆藏信息
    collection: {
      total: 0, // 总数
      available: 0, // 可借数
      isAvailable: true, // 是否可借
    },
    // 订单开始日期：当前日期
    startDate: formatDate(new Date()),
    // 订单最晚取书日期：一个月后
    lastestDate: formatDate(dateAdd('M', 1, new Date())),
    // 预约取书日期
    appointedDate: formatDate(new Date()),
  },

  onLoad(opts) {
    options = opts
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onChange(e) {
    this.setData({ appointedDate: e.detail.value })
  },

  onSubmit(e) {
    wx.showLoading({ title: '加载中', mask: true })
    const { book, library, collection, appointedDate } = this.data
    createOrders([{
      wechat_user_id: getUID(),
      status: collection.available ? ORDER_STATUS_WAITING_TO_TAKE_AT_PLANED_TIME : ORDER_STATUS_WAITING_FOR_OTHERS_TO_RETURN,
      isbn: book.isbn,
      library_id: library.id,
      should_take_time: appointedDate,
    }]).then(() => {
      const params = {
        title: collection.available ? '预订成功' : '预约成功',
        first: collection.available ? `取书时间：${appointedDate}` : `预约图书馆：${library.name}`,
        second: collection.available ? `取书地点：${library.name}` : '当其他用户归还图书时，你将收到系统推送',
      }
      const url = `./children/result?${Object.keys(params).map(k => `${k}=${params[k]}`).join('&')}`
      wx.redirectTo({ url })
    }).finally(() => wx.hideLoading())
  },

  onBack() {
    wx.navigateBack()
  },

  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    const { book_id, library_id } = options
    getCollectionsByBookId(book_id, { library_id }).then((res) => {
      const collection = res.data.collections[0]
      this.setData({
        'pageStatus': 'done',
        'book': res.data.book, // collection.book
        'library': collection.library,
        'collection.total': collection.total_num,
        'collection.available': collection.available_num,
        'collection.isAvailable': collection.is_available,
      })
    },
    ).catch(() => this.setData({ pageStatus: 'error' }))
  },
})
