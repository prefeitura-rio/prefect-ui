import { prefectUser } from '@/middleware/prefectAuth'

const state = {
  user: {
    id: null,
    username: null
  },
  userIsSet: false
}

const getters = {
  user(state) {
    return state.user
  },
  username(state) {
    return state.user.username
  },
  userIsSet(state) {
    return state.userIsSet
  },
  isDark() {
    return localStorage.getItem('dark_mode') === 'true'
  },
  timezone() {
    try {
      fetch('https://ipapi.co/json/').then((response) => {
        return response.json()['timezone']
      })
    } catch (error) {
      return 'America/Sao_Paulo'
    }
  }
}

const mutations = {
  user(state, user) {
    state.user = { ...user }
    state.userIsSet = true
  },
  unsetUser(state) {
    state.user = {
      id: null,
      username: null
    }
    state.userIsSet = false
  }
}

const actions = {
  async setDefaultTenant({ commit, rootGetters }) {
    const firstTenant = rootGetters['tenant/tenants']?.[0]
    commit('tenant/setDefaultTenant', firstTenant, {
      root: true
    })
  },

  async getUser({ commit, getters, dispatch }) {
    const user = await prefectUser()
    commit('user', user)
    dispatch('setDefaultTenant')
    return getters['user']
  }
}

export default {
  getters,
  mutations,
  actions,
  state,
  namespaced: true
}
