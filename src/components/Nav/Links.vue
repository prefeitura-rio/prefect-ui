<script>
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      active: false,
      menu: false
    }
  },
  computed: {
    ...mapGetters('tenant', ['tenant']),
    slug() {
      return this.tenant?.slug
    }
  }
}
</script>

<template>
  <div class="links-container">
    <v-btn
      :to="{
        name: 'dashboard',
        params: {
          tenant: slug
        }
      }"
      class="text-subtitle-1 text-capitalize mx-1 font-weight-medium"
      dark
      small
      depressed
      color="transparent"
      :input-value="$route.name == 'dashboard' || $route.name == 'project'"
      title="Visit your Dashboard"
      exact
    >
      Dashboard
    </v-btn>

    <v-btn
      :to="{
        name: 'agents',
        params: { tenant: slug }
      }"
      class="text-subtitle-1 text-capitalize mx-1 font-weight-medium"
      dark
      small
      depressed
      color="transparent"
      title="Manage your team's agents"
    >
      Agents
    </v-btn>

    <v-btn
      :to="{
        name: 'api',
        params: { tenant: slug }
      }"
      class="text-subtitle-1 text-capitalize mx-1 font-weight-medium"
      dark
      small
      depressed
      color="transparent"
      title="Experiment with GraphQL queries using the Interactive API"
    >
      Interactive API
    </v-btn>

  </div>
</template>

<style lang="scss" scoped>
.links-container {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  white-space: nowrap;

  // stylelint-disable
  &::-webkit-scrollbar {
    display: none;
  }
  // stylelint-enable
}
</style>
