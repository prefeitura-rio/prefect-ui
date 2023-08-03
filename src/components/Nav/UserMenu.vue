<script>
import { mapGetters } from 'vuex'
import CurrentTime from '@/components/Nav/CurrentTime'
import { logout } from '@/auth/index.js'

export default {
  components: {
    CurrentTime
  },
  data() {
    return {
      loading: false,
      model: false,
      routes: [
        {
          title: 'Profile',
          subtitle: 'Some details about what profile is',
          route: {
            name: 'profile'
          }
        },
        {
          title: 'Tokens',
          subtitle: 'Some details about what user tokens are',
          route: {
            name: 'user-tokens'
          }
        }
      ]
    }
  },
  computed: {
    ...mapGetters('auth', ['isAuthorized']),
    ...mapGetters('user', ['user', 'oktaUser', 'isDark'])
  },
  methods: {
    async wipeClientAndLogout() {
      this.loading = true

      try {
        await logout() // Pass true here to propagate this to all clients
        document.querySelector('.router-view').style.opacity = 0
      } catch {
        this.loading = false
      }
    },
    async toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      localStorage.setItem('dark_mode', this.$vuetify.theme.dark.toString())
    }
  }
}
</script>

<template>
  <v-menu
    v-model="model"
    offset-y
    data-cy="nav-bar-menu"
    transition="slide-y-transition"
    :close-on-content-click="false"
    nudge-bottom="15"
  >
    <template #activator="{ on }">
      <v-scale-transition>
        <v-btn
          class="white ml-3 mr-1"
          large
          icon
          title="Open the user menu"
          v-on="on"
        >
          <v-icon large color="grey">
            face
          </v-icon>
        </v-btn>
      </v-scale-transition>
    </template>

    <v-sheet v-if="model" width="300" class="pt-6 text-center">
      <div class="text-center">
        <v-avatar size="64" :tile="true">
          <img
            :src="require('@/assets/logos/logomark-cerulean.svg')"
          />
        </v-avatar>

        <div class="mt-2 text-h6">
          {{ user.username }}
        </div>
      </div>

      <div class="text-caption mb-n2">Theme</div>
      <div class="d-flex flex-row align-center justify-center">
        <span class="mx-3 sun cursor-pointer" @click="toggleDarkMode()"
          ><v-icon size="36px">fad fa-sun</v-icon></span
        >
        <v-switch v-model="isDark" @change="toggleDarkMode()"> </v-switch>
        <span class="mx-3 moon cursor-pointer" @click="toggleDarkMode()"
          ><v-icon size="36px">fad fa-moon-stars</v-icon></span
        >
      </div>

      <v-divider class="grey lighten-3 mx-auto my-2" style="width: 50%;" />

      <current-time class="my-4 text-h4 text-center primary--text" />

      <div>
        <v-btn
          class="appBackground text-capitalize py-6"
          depressed
          block
          :loading="loading"
          @click="wipeClientAndLogout"
        >
          <span class="mr-2">Sign out</span>
          <i class="fad fa-sign-out" />
        </v-btn>
      </div>
    </v-sheet>
  </v-menu>
</template>

<style lang="scss" scoped>
.sun .v-icon {
  color: #ffd932;
}

.moon {
  margin-top: -12px;

  .v-icon {
    color: #93c1e9;
  }
}
</style>
