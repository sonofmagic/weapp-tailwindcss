import { del, get, post } from './request.js'

module.exports = {
  createBooklist(params) {
    return post('/booklists', params)
  },
  getRecommendedBooklistsByUserId(uid) {
    return get(`/booklists/recommend/${uid}`)
  },
  getBooklistById(id, start = 0) {
    return get(`/booklists/${id}?start=${start}`)
  },
  getBooksByBooklistId(id, start = 0) {
    return get(`/booklists/${id}/books?start=${start}`)
  },
  updateBooklistById(id, params) {
    return post(`/booklists/${id}`, params)
  },
  deleteBooklistById(id) {
    return del(`/booklists/${id}`)
  },
  favoriteBooklistById(id) {
    return post(`/booklists/${id}/favorite`)
  },
  getBooklistsByKeyword(keyword, start = 0) {
    return get('/booklists/search', { keyword, start })
  },
  getBooklistsByUserId(uid, type = 'all') {
    return get(`/booklists/users/${uid}?type=${type}`)
  },
}
