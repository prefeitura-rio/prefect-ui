import config from '@/config'

const state = {
  apiToken: null,
  error: null
}

const getters = {
  isAuthenticated(state) {
    return !!state.apiToken
  },
  isAuthorized(state) {
    if (!state.apiToken) return false
    // Fetch sync
    let authorized = false
    return Promise.all([
      fetch(config.url_auth_validate, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.apiToken}`
        }
      })
        .then((response) => response.json())
        .then((data) => {
          if (data?.success) authorized = true
        })
    ]).then(() => {
      return authorized
    })
  },
  apiToken(state) {
    return state.apiToken
  }
}

const mutations = {
  error(state, error) {
    state.error = error
  },
  apiToken(state, apiToken) {
    state.apiToken = apiToken
  },
  unsetApiToken(state) {
    state.apiToken = null
  }
}

const actions = {}

export default {
  state,
  getters,
  mutations,
  actions,
  namespaced: true
}
