import store from '@/store'
import config from '@/config'
import { setStartupTenant } from '@/main.js'

class AuthProxyClient {
  async signIn({ username, password }) {
    const response = await fetch(config.url_auth_login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const data = await response.json()
    return data
  }

  async getTenants({ token }) {
    const response = await fetch(config.url_me_tenant, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      options: { credentials: 'include' }
    })
    const data = await response.json()
    return data
  }
}

export const authClient = new AuthProxyClient()

export const authenticate = async (token = null) => {
  // If we don't have a token, try to get one from local storage
  if (!token) {
    token = localStorage.getItem('apiToken')
  }
  // If we still don't have a token, move to the login page
  if (!token) {
    window.location.href = '/login'
    return
  }
  // Store the token in the store and local storage
  localStorage.setItem('apiToken', token)
  store.commit('auth/apiToken', token)
  // Get tenants from the server
  const tenants = await authClient.getTenants({ token })
  // Store the tenants in the store
  store.commit('tenant/setTenants', tenants)
  setStartupTenant()
  // Trigger store action
  store.dispatch('user/getUser')
  return token
}
