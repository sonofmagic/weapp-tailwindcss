import { del, get, post } from './request.js'

module.exports = {
  addReviewByBookId(id, params) {
    return post(`/books/${id}/reviews`, params)
  },
  getReviewsByBookId(id, start = 0) {
    return get(`/books/${id}/reviews?start=${start}`)
  },
  getReviewsByUserId(uid, start = 0) {
    return get(`/users/${uid}/reviews?start=${start}`)
  },
  deleteReviewById(id) {
    return del(`/reviews/${id}`)
  },
}
