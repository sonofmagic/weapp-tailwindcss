import { cancelOrderByOrderId, getOrdersByUserId } from '../../../apis/order'
import { getUID } from '../../../utils/permission'

const app = getApp()

Page({
  data: {
    pageStatus: 'loading', // error, done
    tabs: ['全部', '预约中', '借阅中'],
    types: ['ongoing', 'booking', 'borrowing'],
    currentType: 'ongoing', // 当前激活的选项卡类型
    orders: {
      // 进行中订单
      ongoing: [],
      // 预约中
      booking: [],
      // 借阅中
      borrowing: [],
    },
    loadMoreStatus: {
      ongoing: 'hidding', // loading, nomore, hidding
      booking: 'hidding',
      borrowing: 'hidding',
    },
  },

  /**
   * 初始时加载所有类型订单/**
   * @listens <orderCanceled> <orderRenewed>
   * 事件在订单详情页(./children/order-detail)中被触发
   */
  onLoad() {
    // 监听事件
    app.event.on('orderCanceled', this.onOrderCanceled)
    app.event.on('orderRenewed', this.onOrderRenewed)

    this._loadPage()
  },

  onReloadPage() {
    this._loadPage()
  },

  /**
   * 滚动到底部时，根据订单类型，加载对应数据
   */
  onScrollToLower() {
    const type = this.data.currentType
    const orders = this.data.orders[type]
    const length = orders.length

    const loadMoreStatus = this.data.loadMoreStatus[type]
    if (loadMoreStatus !== 'hidding') { return }

    // 设置“加载中”
    const params = {}
    params[`loadMoreStatus.${type}`] = 'loading'
    this.setData(params)

    // 加载数据
    getOrdersByUserId(getUID(), type, length).then((res) => {
      const params = {}
      params[`orders.${type}`] = orders.concat(res.data.orders)
      params[`loadMoreStatus.${type}`] = res.data.orders.length ? 'hidding' : 'nomore'
      this.setData(params)
    }).catch(() => this.setData({
      loadMoreStatus: {
        ongoing: 'hidding',
        booking: 'hidding',
        borrowing: 'hidding',
      },
    }))
  },

  onClickTabBar(e) {
    this.setData({ currentType: this.data.types[e.detail.index] })
  },

  onCancel(e) {
    const id = e.currentTarget.id
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单？这项操作将无法撤销',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中', mask: true })
          cancelOrderByOrderId(id).then(() => {
            wx.showToast({ title: '取消成功' })
            this._deleteOrderById(id)
          }).finally(() => wx.hideLoading())
        }
      },
    })
  },

  /**
   * 某个订单被取消，更新列表
   */
  onOrderCanceled(e) {
    this._deleteOrderById(e.order.id)
  },

  /**
   * 某个订单被续借，更新列表
   */
  onOrderRenewed(e) {
    const id = e.order.id
    const newOrder = e.order
    const { ongoing, borrowing } = this.data.orders
    this.setData({
      'orders.ongoing': ongoing.map(old => old.id == id ? newOrder : old),
      'orders.borrowing': borrowing.map(old => old.id == id ? newOrder : old),
    })
  },

  /**
   * 删除订单：从“全部(ongoing)”和“预约中(booking)”订单列表里同时删除
   */
  _deleteOrderById(id) {
    const { ongoing, booking } = this.data.orders
    this.setData({
      'orders.ongoing': ongoing.filter(e => e.id != id),
      'orders.booking': booking.filter(e => e.id != id),
    })
  },

  /**
   * 加载页面
   */
  _loadPage() {
    this.setData({ pageStatus: 'loading' })
    Promise.all([
      getOrdersByUserId(getUID(), 'ongoing'),
      getOrdersByUserId(getUID(), 'booking'),
      getOrdersByUserId(getUID(), 'borrowing'),
    ]).then((res) => {
      this.setData({
        pageStatus: 'done',
        orders: {
          ongoing: res[0].data.orders,
          booking: res[1].data.orders,
          borrowing: res[2].data.orders,
        },
      })
    }).catch(() => this.setData({ pageStatus: 'error' }))
  },
})
