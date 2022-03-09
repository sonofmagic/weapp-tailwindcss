export default {
  FAKE_ACTION({ commit }, input) {
    setTimeout(() => {
      commit('FAKE_MUTATION', input)
    }, 500)
  }
}
