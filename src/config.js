const { VUE_APP_SERVER_URL } = process.env

export default {
  url_graphql: VUE_APP_SERVER_URL + '/proxy/',
  url_auth_login: VUE_APP_SERVER_URL + '/auth/login',
  url_auth_validate: VUE_APP_SERVER_URL + '/auth/validate',
  url_me: VUE_APP_SERVER_URL + '/user/me',
  url_me_tenant: VUE_APP_SERVER_URL + '/user/me/tenant/',
  url_me_tenant_id: (tenantId) =>
    VUE_APP_SERVER_URL + `/user/me/tenant/${tenantId}`
}
