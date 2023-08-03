<script>
import { mapMutations, mapGetters } from 'vuex'
export default {
  data() {
    return {
      // Delete team
      deleteTeamDialog: false,
      deleteTeamFormValid: false,
      deleteTeamTimeout: null,
      deleteTeamLoading: false,
      deleteTeamError: null,

      // Form rules
      rules: {
        confirm: value => value == 'confirm' || 'Input is incorrect.',
        nameMatches: value =>
          value == this.tenant.name || 'Input must match Team Name.',
        required: value => !!value || 'This field is is required.'
      },

      // Misc
      teamName: null,
      show: true
    }
  },
  computed: {
    ...mapGetters('tenant', ['tenant', 'role']),
  },
  watch: {
    tenant() {
      this.show = false

      setTimeout(() => {
        this.show = true
      }, 1000)
    }
  },
  methods: {
    ...mapMutations('tenant', ['setTenant', 'unsetTenant']),
    _closeTeamDialog() {
      this.deleteTeamDialog = false
      this.teamName = null
      this.deleteTeamLoading = false
      this.deleteTeamError = null
      clearTimeout(this.deleteTeamTimeout)
    },
    async deleteTeam() {
      clearTimeout(this.deleteTeamTimeout)
      this.deleteTeamLoading = true
      const deleteTeam = await this.$apollo.mutate({
        mutation: require('@/graphql/Tenant/delete-tenant.gql'),
        variables: {
          input: {
            confirm: true
          }
        }
      })
      this.deleteTeamTimeout = setTimeout(() => {
        this.deleteTeamLoading = false
        this.teamName = null
        this.nameMatches = false
        if (deleteTeam?.data?.delete_tenant?.success) {
          this.unsetTenant()
          this.$router.push({ name: 'dashboard', tenant: this.tenant?.slug })
        } else {
          this.deleteTeamError = 'Something went wrong.'
        }
      }, 750)
    }
  }
}
</script>

<template>
  <v-container>
    <v-navigation-drawer
      clipped
      left
      fixed
      permanent
      touchless
      expand-on-hover
      :mini-variant="$vuetify.breakpoint.smAndDown"
      :style="{
        height: `calc(100% - ${$vuetify.breakpoint.smAndDown ? 56 : 64}px)`,
        top: $vuetify.breakpoint.smAndDown ? '56px' : '64px'
      }"
    >
      <template #prepend>
        <v-list-item>
          <v-list-item-action>
            <v-icon class="blue--text accent-4">
              settings
            </v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <div class="font-weight-medium">
              Team
            </div>
          </v-list-item-content>
        </v-list-item>
      </template>

      <v-divider />

      <v-list dense>
        <v-list-item
          :disabled="false"
          :to="{ name: 'tokens', params: { tenant: tenant.slug } }"
          data-cy="team-settings-api-tokens"
          ripple
          exact
        >
          <v-list-item-action>
            <v-icon>sync_alt</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>API Tokens</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'actions', params: { tenant: tenant.slug } }"
          ripple
          exact
        >
          <v-list-item-action>
            <i class="fad fa-random" style="width: 24px; height: 24px;"></i>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Automation Actions</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :to="{ name: 'cloud-hooks', params: { tenant: tenant.slug } }"
          ripple
          exact
          data-cy="cloud-hooks"
        >
          <v-list-item-action>
            <v-icon>cloud_queue</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Cloud Hooks</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'flow-concurrency', params: { tenant: tenant.slug } }"
          ripple
          exact
          data-cy="flow-concurrency"
        >
          <v-list-item-action>
            <v-icon>pi-flow-run</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Flow Concurrency</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :to="{ name: 'flow-groups', params: { tenant: tenant.slug } }"
          ripple
          exact
        >
          <v-list-item-action>
            <v-icon>pi-flow</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Flow Groups</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'kv', params: { tenant: tenant.slug } }"
          ripple
          exact
        >
          <v-list-item-action>
            <i
              class="fad fa-brackets-curly"
              style="width: 24px; height: 24px;"
            ></i>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>KV Store</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'members', params: { tenant: tenant.slug } }"
          ripple
          exact
          data-cy="members"
        >
          <v-list-item-action>
            <v-icon>people</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Members</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :to="{ name: 'projects', params: { tenant: tenant.slug } }"
          ripple
          exact
        >
          <v-list-item-action>
            <v-icon>pi-project</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Projects</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'roles', params: { tenant: tenant.slug } }"
          ripple
          exact
        >
          <v-list-item-action>
            <v-icon>face</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title
              >Roles
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'secrets', params: { tenant: tenant.slug } }"
          ripple
          exact
        >
          <v-list-item-action>
            <v-icon>vpn_key</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Secrets</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'service-accounts', params: { tenant: tenant.slug } }"
          ripple
          exact
        >
          <v-list-item-action>
            <v-icon>engineering</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Service Accounts</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          :disabled="false"
          :to="{ name: 'task-concurrency', params: { tenant: tenant.slug } }"
          ripple
          exact
          data-cy="task-concurrency"
        >
          <v-list-item-action>
            <v-icon>pi-task-run</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Task Concurrency</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <div
      :class="{
        'sm-and-down-left-padding': $vuetify.breakpoint.smAndDown,
        'sm-and-up-left-padding': $vuetify.breakpoint.smAndUp
      }"
    >
      <v-fade-transition mode="out-in">
        <router-view></router-view>
      </v-fade-transition>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.cursor-point {
  cursor: pointer;
}

.sm-and-up-left-padding {
  // Match left padding with User Settings sidebar width
  padding-left: 56px;
}

.sm-and-down-left-padding {
  // Match left padding with collapsed User Settings sidebar width
  padding-left: 56px;
}

.transition-height {
  transition: max-height 500ms ease;
}
</style>

<style lang="scss">
.text-center {
  // stylelint-disable
  .v-skeleton-loader__heading {
    margin: auto !important;
  }
  // stylelint-enable
}
</style>
