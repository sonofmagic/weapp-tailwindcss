import { del, get, post } from './request.js'

module.exports = {
  createOrders(params) {
    return post('/orders', params)
  },
  getOrderById(id) {
    return get(`/orders/${id}`)
  },
  getOrdersByUserId(uid, type, start = 0) {
    return get(`/orders/users/${uid}`, { type, start })
  },
  cancelOrderByOrderId(id) {
    return post(`/orders/${id}/cancel`)
  },
  renewBookByOrderId(id) {
    return post(`/orders/${id}/renew`)
  },
  deleteOrderByOrderId(id) {
    return del(`/orders/${id}`)
  },
}
