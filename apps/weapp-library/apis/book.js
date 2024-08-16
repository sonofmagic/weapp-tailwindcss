import { get } from './request.js'

module.exports = {
  getBookById(id) {
    return get(`/books/${id}`)
  },
  getBookByISBN(isbn) {
    return get(`/books/isbn/${isbn}`)
  },
  getRankingBooks(start = 0) {
    return get(`/books/ranking?start=${start}`)
  },
  getRecommendedBooksByUserId(uid) {
    return get(`/books/recommend/${uid}`)
  },
  getBooksByKeyword(keyword, start = 0) {
    return get('/books/search', { keyword, start })
  },
  getBooksByAuthor(author, start = 0) {
    return get(`/books/authors/${author}?start=${start}`)
  },
  getBooksByTag(tag, start = 0) {
    return get(`/books/tags/${tag}?start=${start}`)
  },
  getBooksByAdvancedSearch(params) {
    return get('/books/search/advanced', params)
  },
  getBooksByClassificationNumber(classNum, start = 0) {
    return get(`/books/classifications/${classNum}?start=${start}`)
  },
}
