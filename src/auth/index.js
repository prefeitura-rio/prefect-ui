import { authenticate } from '@/auth/authentication.js'
import { authorizeTenant } from '@/auth/authorization.js'

import store from '@/store'

export const unsetTokens = () => {
  store.commit('auth/unsetIdToken')
  store.commit('auth/unsetIdTokenExpiry')
  store.commit('auth/unsetUser')
  store.commit('auth/unsetAuthorizationToken')
  store.commit('auth/unsetAuthorizationTokenExpiry')
  store.commit('auth/unsetRefreshToken')
  store.commit('auth/unsetRefreshTokenExpiry')
}

export const login = async () => {
  // try getting a token from the service worker
  // if we have a service worker, ping that for a token
  // otherwise we go through the okta login process directly
  let apiToken
  try {
    apiToken = await authenticate()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Login error', e)
  }
  await authenticate(apiToken)

  return apiToken
}

export const switchTenant = async (tenantId) => {
  let apiToken

  apiToken = await authorizeTenant(store.getters['auth/apiToken'], tenantId)

  return {
    apiToken: apiToken
  }
}

export const logout = async () => {
  localStorage.removeItem('apiToken')
  store.commit('auth/unsetApiToken')
  store.commit('tenant/unsetTenant')
  store.commit('tenant/unsetTenants')
  store.commit('user/unsetUser')
  window.location.href = '/'
}
