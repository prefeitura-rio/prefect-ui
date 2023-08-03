// Core
import Vue from 'vue'
import Vuex from 'vuex'

// Modules
import agent from '@/store/agent'
import api from '@/store/api'
import auth from '@/store/auth'
import data from '@/store/data'
import license from '@/store/license'
import refresh from '@/store/refresh'
import sideNav from '@/store/sideNav'
import tenant from '@/store/tenant'
import user from '@/store/user'
import alert from '@/store/alert'
import polling from '@/store/polling'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    agent,
    alert,
    api,
    auth,
    data,
    license,
    polling,
    refresh,
    sideNav,
    tenant,
    user
  },
  strict: process.env.NODE_ENV !== 'production',
  plugins: []
})

export default store
