import { authorize, authorizeTenant } from '@/auth/authorization.js'
import jwt_decode from 'jwt-decode'

const ports = []
const channelPorts = []

const state = {
  idToken: null,
  apiToken: null,
  tenantId: null
}

const postToConnections = (payload) => {
  for (let i = 0; i < ports.length; ++i) {
    ports[i].postMessage(payload)
  }
}

const postToChannelPorts = (payload) => {
  for (let i = 0; i < ports.length; ++i) {
    channelPorts[i]?.postMessage(payload)
  }
  channelPorts.length = 0
}

console.connect = (payload) => {
  // eslint-disable
  console.groupCollapsed('Auth worker trace', payload)
  console.log(payload)
  console.trace()
  console.groupEnd()
  // eslint-enable

  for (let i = 0; i < ports.length; ++i) {
    ports[i].postMessage({
      type: 'console',
      payload: payload
    })
  }
}

const handleSwitchTenant = async (tenantId) => {
  console.log('THIS IS CALLED')
  const authorizationResponse = await authorizeTenant(state.apiToken, tenantId)

  setAuthorizationToken(authorizationResponse)

  postToConnections({
    type: 'switch-tenant',
    payload: { token: state.apiToken, tenantId: tenantId }
  })

  console.connect({
    message: 'handleSwitchTenant',
    tokenExpiration: state.apiToken?.expires_at || 'No token',
    tenantId: tenantId,
    currentTime: Date.now()
  })
}

const setAuthorizationToken = (token) => {
  state.apiToken = token

  postToChannelPorts({
    type: 'apiToken',
    payload: state.apiToken
  })

  postToConnections({
    type: 'apiToken',
    payload: state.apiToken
  })

  try {
    const expiration = new Date(token.expires_at)
    const timeout = ((expiration - Date.now()) * 3) / 4

    console.connect({
      message: 'setAuthorizationToken',
      tokenExpiration: token.expires_at || 'No token',
      currentTime: new Date().toString()
    })
  } catch (e) {
    postToConnections({ type: 'error', payload: e })
  }
}

const handleLogin = async () => {
  console.connect({
    message: 'handleLogin',
    tokenExpiration: state.idToken?.expiresAt
      ? state.idToken.expiresAt * 1000
      : 'No Token',
    currentTime: new Date().toString()
  })

  postToChannelPorts({ payload: state.idToken })
}

const handleLogout = () => {
  state.idToken = null
  state.apiToken = null
  postToConnections({ type: 'logout' })
  console.connect({
    message: 'handleLogout',
    tenantId: state.tenantId,
    currentTime: new Date().toString()
  })
}

const handleClear = () => {
  state.idToken = null
  state.apiToken = null
  console.connect({
    message: 'handleClear',
    tenantId: state.tenantId || 'No tenant',
    currentTime: new Date().toString()
  })
}

let authorizing = false
const handleAuthorize = async (idToken) => {
  authorizing = true
  if (
    !state.apiToken ||
    (state.apiToken && new Date(state.apiToken.expires_at) <= Date.now())
  ) {
    const authorizationResponse = await authorize(idToken)

    if (authorizationResponse && authorizationResponse.access_token) {
      setAuthorizationToken(authorizationResponse)
    } else {
      postToConnections({ type: 'accessDenied', payload: state.idToken })
    }
  }

  postToChannelPorts({ payload: state.apiToken })
  authorizing = false
}

const connect = (c) => {
  const port = c.ports[0]
  ports.push(port)

  port.onmessage = async (e) => {
    try {
      const type = e.data?.type
      const channelPort = e.ports[0]
      const payload = e.data?.payload

      if (type == 'login') {
        channelPorts.push(channelPort)
        await handleLogin()
      }

      if (type == 'idToken') {
        state.idToken = payload
      }

      if (type == 'logout') {
        handleLogout()
      }

      if (type == 'authorize') {
        channelPorts.push(channelPort)
        if (!authorizing) {
          await handleAuthorize(payload)
        }
      }

      if (type == 'switch-tenant') {
        channelPorts.push(channelPort)
        await handleSwitchTenant(payload)
      }

      if (type == 'clear') {
        handleClear()
      }
    } catch (e) {
      postToConnections({ type: 'error', payload: e })
    }
  }

  port.start() // Required when using addEventListener. Otherwise called implicitly by onmessage setter.
}

self.onconnect = connect

self.onerror = (e) => {
  // eslint-disable-next-line no-console
  console.log('in error handler', e)
  console.connect({
    message: 'error',
    error: e
  })
}
