import Vue from 'vue'
import Vuex from 'vuex'
import { getMapToken } from '@/api/index'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: ''
  },
  getters: {
    hasToken: (state) => !!state.token
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
    }
  },
  actions: {
    async GET_TOKEN(context) {
      const res = await getMapToken()
      context.commit('SET_TOKEN', res.msg)
    }
  },
  modules: {}
})
