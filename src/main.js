// import { login, switchTenant, logout } from '@/auth/index.js'
import { login } from '@/auth/index.js'
import { CreatePrefectUI } from '@/app.js'
import store from '@/store'

export const setStartupTenant = async () => {
  const path = window.location.pathname
  const split = path.split('/')
  const slug = split?.[1]
  const tenants = store.getters['tenant/tenants']
  const slugTenant = tenants.find((t) => t.slug == slug)

  let tenant
  if (slugTenant) tenant = slugTenant
  else tenant = tenants[0]

  tenant.role = 'TENANT_ADMIN'

  store.commit('tenant/setTenant', tenant)
}

// const timeout = async (main, fallback, fallbackargs, time) =>
//   Promise.race([main, new Promise((_r, rej) => setTimeout(rej, time))]).catch(
//     () => {
//       localStorage.setItem('prefect_fallback_auth', Date.now())
//       return fallback(...fallbackargs)
//     }
//   )

let loading = false
export const start = async () => {
  if (
    window.location.pathname?.includes('logout') ||
    window.location.pathname?.includes('access-denied') ||
    window.location.pathname?.includes('login')
  ) {
    CreatePrefectUI()
    return
  }

  const start0 = performance.now()
  // we run this when the application starts or a user returns to the page after some time away
  // this logs into the default tenant so that we can fetch information we need
  // if the user is requesting a different tenant (indicated by the URL),
  // we swap out these tokens later
  loading = true

  let apiToken

  apiToken = await login()

  if (!apiToken) {
    return
  }

  loading = false

  try {
    // This is a good place to implement browser-side InnoDB or other caching
    await Promise.all([
      // store.dispatch('user/getUser'),
      store.dispatch('tenant/getTenants')
    ])
    await setStartupTenant()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)
  }

  const start1 = performance.now()

  // eslint-disable-next-line no-console
  console.log('Start total: ', start1 - start0)
  CreatePrefectUI()
}

start()

// ******************************************************************************************
// Browser visibility API handler for auth
// ******************************************************************************************

// Visibility change properties vary between browsers
let hidden, visibilityChange

const handleVisibilityChange = async () => {
  if (loading) return

  loading = true

  if (!document[hidden]) {
    if (
      (!store.getters['auth/isAuthenticated'] ||
        !store.getters['auth/isAuthorized']) &&
      !window.location.pathname?.includes('logout') &&
      !window.location.pathname?.includes('access-denied')
    ) {
      // let tokens

      // We check local storage for a fallback token and compare it against
      // the curent timestamp - 1 minute. If it falls outside that window
      // we attempt the normal flow
      const fallbackTimestamp = localStorage.getItem('prefect_fallback_auth')

      // We coerce the timestamp because localstorage stores it as a string
      if (fallbackTimestamp && +fallbackTimestamp > Date.now() - 60000) {
        // tokens = await login()
      } else {
        // tokens = await timeout(login(), login, [true], 10000)
      }

      // if (!tokens) logout()
    }
  }

  loading = false
}

if (window) {
  if (typeof document.hidden !== 'undefined') {
    // Opera 12.10 and Firefox 18 and later
    hidden = 'hidden'
    visibilityChange = 'visibilitychange'
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden'
    visibilityChange = 'msvisibilitychange'
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden'
    visibilityChange = 'webkitvisibilitychange'
  }
  window.addEventListener(visibilityChange, handleVisibilityChange, false)
}
