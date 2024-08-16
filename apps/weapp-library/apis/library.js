import { get } from './request.js'

module.exports = {
  getLibraryById(id) {
    return get(`/libraries/${id}`)
  },
}
