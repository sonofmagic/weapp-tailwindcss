import { get } from './request.js'

module.exports = {
  getCollectionsByBookId(id, params = {}) {
    return get(`/books/${id}/collections`, params)
  },
  getCollectionsByBookISBN(isbn, params = {}) {
    return get(`/books/isbn/${isbn}/collections`, params)
  },
}
