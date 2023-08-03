import { prefectTenants } from '@/middleware/prefectAuth'
// import { switchTenant } from '@/auth/index.js'

const state = {
  defaultTenant: null,
  tenant: {
    id: null,
    slug: null
  },
  isLoadingTenant: false,
  tenantIsSet: false,
  tenants: []
}

const getters = {
  defaultTenant(state) {
    return state.defaultTenant
  },
  isLoadingTenant(state) {
    return state.isLoadingTenant
  },
  tenant(state) {
    return state.tenant || state.defaultTenant
  },
  tenantIsSet(state) {
    return !!state.tenant?.id
  },
  tenants(state) {
    return state.tenants
  }
}

const mutations = {
  setDefaultTenant(state, tenant) {
    if (
      !tenant ||
      typeof tenant !== 'object' ||
      Array.isArray(tenant) ||
      Object.keys(tenant) < 1
    ) {
      throw new Error('passed invalid or empty tenant object')
    }
    state.defaultTenant = tenant
  },
  setIsLoadingTenant(state, value) {
    if (typeof value !== 'boolean') {
      throw new Error(
        `passed invalid value to setIsLoadingTenant mutation, got ${typeof val}, expected Boolean.`
      )
    }

    state.isLoadingTenant = value
  },
  setTenant(state, tenant) {
    if (
      !tenant ||
      typeof tenant !== 'object' ||
      Array.isArray(tenant) ||
      Object.keys(tenant) < 1
    ) {
      throw new Error('passed invalid or empty tenant object')
    }
    state.tenant = { ...tenant }
  },
  setTenants(state, tenants) {
    if (!tenants || tenants?.length === 0) {
      throw new Error('passed invalid or empty tenant array')
    }
    state.tenants = tenants
  },
  unsetTenant(state) {
    state.tenant = {
      id: null,
      name: null,
      info: null,
      slug: null,
      role: null,
      licenses: [],
      settings: {},
      prefectAdminSettings: {},
      stripe_customer: null
    }
  },
  unsetTenants(state) {
    state.tenants = []
  }
}

const actions = {
  async getTenants({ commit, getters }) {
    try {
      const tenants = await prefectTenants()
      commit('setTenants', tenants)
      // Make sure the current tenant object is updated
      if (getters['tenantIsSet']) {
        let tenant = getters['tenants']?.find(
          (t) => t.id === getters['tenant'].id
        )
        commit('setTenant', tenant)
      }
    } catch (e) {
      console.error('Error getting tenants', e)
      throw e
    }
    return getters['tenants']
  },
  async setCurrentTenant({ commit, dispatch, getters }, slug) {
    slug = slug || getters['defaultTenant']?.slug || getters['tenants'][0]?.slug

    if (!slug) {
      throw new Error(
        'No slug was provided when trying to set the current tenant'
      )
    }

    try {
      commit('setIsLoadingTenant', true)

      let tenant = getters['tenants']?.find((t) => t.slug === slug)

      if (!tenant) {
        // If the tenant doesn't exist
        // try to retrieve tenants again

        await dispatch('getTenants')
      }

      tenant = getters['tenants']?.find((t) => t.slug === slug)
      if (!tenant) {
        throw new Error("Unable to set current tenant: tenant doesn't exist")
      }

      // We only need to get new tokens if we have a tenant
      // already - otherwise tokens are fetched through the initial
      // authorization process
      if (getters['tenantIsSet']) {
        // const tokens = await switchTenant(tenant.id)
        // commitTokens(tokens)
      }
      commit('setTenant', tenant)
    } catch (e) {
      throw new Error(`Problem setting tenant: ${e}`)
    }

    commit('setIsLoadingTenant', false)
    return getters['tenant']
  }
}

export default {
  actions,
  getters,
  mutations,
  state,
  namespaced: true
}
