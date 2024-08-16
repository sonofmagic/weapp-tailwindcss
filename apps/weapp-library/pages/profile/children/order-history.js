import { getOrdersByUserId } from '../../../apis/order'
import { getUID } from '../../../utils/permission'

Page({
  data: {
    pageStatus: 'loading', // error, done
    orders: [],
    loadMoreStatus: 'hidding', // loading, nomore
  },

  /**
   * @listens <orderDeleted>
   * 事件在订单详情页(./children/order-detail)中被触发
   */
  onLoad() {
    // 监听事件
    getApp().event.on('orderDeleted', this.onOrderDeleted)
    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  onReachBottom() {
    const { loadMoreStatus, orders } = this.data
    if (loadMoreStatus !== 'hidding') { return }

    this.setData({ loadMoreStatus: 'loading' })
    getOrdersByUserId(getUID(), 'history', orders.length).then((res) => {
      this.setData({
        orders: orders.concat(res.data.orders),
        loadMoreStatus: res.data.orders.length ? 'hidding' : 'nomore',
      })
    }).catch(() => this.setData({ loadMoreStatus: 'hidding' }))
  },

  onOrderDeleted(e) {
    const { orders } = this.data
    const orderId = e.order.id
    this.setData({ orders: orders.filter(e => e.id != orderId) })
  },

  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    getOrdersByUserId(getUID(), 'history').then((res) => {
      this.setData({
        pageStatus: 'done',
        orders: res.data.orders,
      })
    }).catch(() => this.setData({ pageStatus: 'error' }))
  },
})
