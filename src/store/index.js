import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    reservedInfoList: []
  },
  mutations: {
    setReservedInfoList(state, payload) {
      state.reservedInfoList = payload
    }
  },
  actions: {
  },
  modules: {
  }
})
