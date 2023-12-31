import { Client } from '@/apollo.js'
import config from '@/config'

const client = Client('authorization')

const headers = {
  'X-PREFECT-UI': true,
  'X-Backend': 'cloud'
}

export const authorize = async (idToken) => {
  if (!idToken) {
    throw new Error('No ID token passed to authorize')
  }

  const res = await client.mutate({
    mutation: require('@/graphql/log-in.gql'),
    variables: {
      input: { id_token: idToken }
    },
    context: {
      headers: headers
    },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache'
  })

  return res?.data?.log_in
}

export const refreshTokens = async (accessToken, refreshToken) => {
  if (!accessToken || !refreshToken) {
    throw new Error('No access or refresh token passed to refreshTokens')
  }

  const res = await client.mutate({
    mutation: require('@/graphql/refresh-token.gql'),
    variables: {
      input: { access_token: accessToken }
    },
    context: {
      headers: {
        ...headers,
        authorization: `Bearer ${refreshToken}`
      }
    },
    fetchPolicy: 'no-cache'
  })

  return res?.data?.refresh_token
}

export const authorizeTenant = async (accessToken, tenantId) => {
  if (!accessToken || !tenantId) {
    throw new Error('No access token or no tenant id passed to authorizeTenant')
  }

  const res = await fetch(config.url_me_tenant_id(tenantId), {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  })

  const data = await res.json()

  if (res.status === 200 && data?.success) return accessToken

  throw new Error('Failed to switch tenant')
}

export const revokeTokens = async (accessToken, refreshToken) => {
  if (!accessToken) {
    throw new Error('No access token passed to revokeToken')
  }

  const res = await client.mutate({
    mutation: require('@/graphql/log-out.gql'),
    variables: {
      input: { access_token: accessToken }
    },
    context: {
      headers: {
        ...headers,
        authorization: `Bearer ${refreshToken}`
      }
    },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache'
  })

  return res?.data?.success
}
