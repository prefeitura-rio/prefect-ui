<script>
import { mapActions, mapGetters } from 'vuex'

import Actions from '@/pages/FlowRun/Actions'
import BreadCrumbs from '@/components/BreadCrumbs'
import NavTabBar from '@/components/NavTabBar'
import DetailsTile from '@/pages/FlowRun/Details-Tile'
import EditableTextField from '@/components/EditableTextField'
import TimelineTile from '@/pages/FlowRun/Timeline-Tile'
import LogsCard from '@/components/LogsCard/LogsCard'
import SchematicTile from '@/pages/FlowRun/Schematic-Tile'
import SubPageNav from '@/layouts/SubPageNav'
import TaskRunHeartbeatTile from '@/pages/FlowRun/TaskRunHeartbeat-Tile'
import TaskRunTableTile from '@/pages/FlowRun/TaskRunTable-Tile'
import TileLayout from '@/layouts/TileLayout'
import TileLayoutFull from '@/layouts/TileLayout-Full'
import { parser } from '@/utils/markdownParser'
import { FINISHED_STATES } from '@/utils/states'

export default {
  metaInfo() {
    return {
      title: this.flowRun
        ? `Run | ${this.flowRun.flow?.name} - ${this.flowRun.name}`
        : null,
      link: [
        {
          rel: 'icon',
          type: 'image/svg',
          href: this.flowRun
            ? `/state-icons/${this.flowRun.state.toLowerCase()}.svg`
            : null,
          vmid: 'favicon'
        }
      ]
    }
  },
  components: {
    Actions,
    BreadCrumbs,
    DetailsTile,
    EditableTextField,
    TimelineTile,
    LogsCard,
    NavTabBar,
    SchematicTile,
    SubPageNav,
    TaskRunHeartbeatTile,
    TaskRunTableTile,
    TileLayout,
    TileLayoutFull
  },
  data() {
    return {
      error: false,
      flowRunNameLoading: false,
      loadingKey: 0,
      tabs: [
        {
          name: 'Overview',
          target: 'overview',
          icon: 'view_quilt'
        },
        {
          name: 'Schematic',
          target: 'schematic',
          icon: 'pi-schematic'
        },
        {
          name: 'Logs',
          target: 'logs',
          icon: 'format_align_left'
        },
      ]
    }
  },
  computed: {
    ...mapGetters('tenant', ['tenant']),
    flowId() {
      return this.flowRun?.flow_id
    },
    flowRunId() {
      return this.$route.params.id
    },
    loading() {
      return this.loadingKey > 0
    },
    flowRunNameLength() {
      return this.flowRun?.name?.length
    },
    titleBarMaxWidth() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return '70vw'
      } else if (this.$vuetify.breakpoint.mdAndDown) {
        return '40vw'
      }
      return '30vw'
    },
    tab: {
      get() {
        const keys = Object.keys(this.$route.query ?? {})
        if (keys.length > 0 && this.tabs?.find(tab => tab.target == keys[0])) {
          return keys[0]
        }

        return 'overview'
      },
      set(value) {
        this.$router.replace({ query: { [value]: null } })
      }
    }
  },
  methods: {
    ...mapActions('alert', ['setAlert']),
    parseMarkdown(md) {
      return parser(md)
    },
    async saveFlowRunName(e) {
      const previousName = this.flowRun.name
      if (previousName === e) return

      try {
        this.flowRunNameLoading = true

        const { data } = await this.$apollo.mutate({
          mutation: require('@/graphql/Mutations/set-flow-run-name.gql'),
          variables: {
            input: {
              flow_run_id: this.flowRunId,
              name: e
            }
          }
        })

        await this.$apollo.queries.flowRun.refetch()

        if (!data.set_flow_run_name.success) {
          throw new Error(data.set_flow_run_name.error)
        }

        this.setAlert({
          alertShow: true,
          alertMessage: `<span class="font-weight-medium">${previousName}</span> has been renamed to <span class="font-weight-medium">${e}</span>`,
          alertType: 'success'
        })
      } catch {
        this.setAlert({
          alertShow: true,
          alertMessage:
            'Oops! Something went wrong while trying to update your flow run name, please try again.',
          alertType: 'error'
        })
      } finally {
        this.flowRunNameLoading = false
      }
    },
    onIntersect([entry]) {
      this.$apollo.queries.flowRun.skip = !entry.isIntersecting
    },
    handleRefetch() {
      this.$apollo.queries.flowRun.refetch()
    }
  },
  apollo: {
    flowRun: {
      query() {
        return require('@/graphql/FlowRun/flow-run.js').default()
      },
      variables() {
        return {
          id: this.flowRunId
        }
      },
      loadingKey: 'loadingKey',
      error(error) {
        if (error.toString().includes('invalid input')) {
          this.error = true
        }
      },
      pollInterval: 5000,
      update(data) {
        if (!data) return

        const flowRun = data.flow_run_by_pk
        if (
          FINISHED_STATES.includes(flowRun.state) &&
          flowRun.state !== 'Scheduled'
        ) {
          this.$apollo.queries.flowRun.stopPolling()

          this.$apollo.queries.flowRun.startPolling(60000)
        }
        return flowRun
      }
    }
  }
}
</script>

<template>
  <v-sheet
    v-if="error && !flowRun"
    v-intersect="{ handler: onIntersect }"
    color="appBackground"
    class="position-relative"
  >
    <div
      class="text-center position-absolute center-absolute text-h4 grey--text text--darken-2"
      style="z-index: 1;"
    >
      Sorry, we weren't able to find this run.
    </div>
  </v-sheet>
  <v-sheet v-else-if="flowRun" color="appBackground">
    <SubPageNav icon="pi-flow-run" page-type="Flow Run">
      <span
        slot="page-title"
        class="minTitleWidth"
        :style="{
          display: $vuetify.breakpoint.smAndDown ? 'inline' : 'block',
          width: flowRunNameLength + 'ch',
          maxWidth: titleBarMaxWidth
        }"
      >
        <EditableTextField
          :content="flowRun.name"
          label="Flow run name"
          :loading="flowRunNameLoading"
          required
          @change="saveFlowRunName"
        />
      </span>

      <span
        slot="breadcrumbs"
        :style="
          $vuetify.breakpoint.smAndDown && {
            display: 'inline',
            'font-size': '0.875rem'
          }
        "
      >
        <BreadCrumbs
          :crumbs="[
            {
              route: {
                name: 'project',
                params: { id: flowRun.flow.project.id }
              },
              text: flowRun.flow.project.name
            },
            {
              route: {
                name: 'flow',
                params: { id: flowRun.flow.flow_group_id }
              },
              text: flowRun.flow.name
            },
            {
              route: {
                name: 'flow',
                params: { id: flowRun.flow.id }
              },
              text:
                flowRun.flow.version == flowRun.version
                  ? `Version ${flowRun.flow.version} (Current)`
                  : `Version ${flowRun.flow.version}`
            }
          ]"
        />
      </span>

      <Actions
        slot="page-actions"
        style="height: 55px;"
        :flow-run="flowRun"
        @update="$apollo.queries['flowRun'].refetch()"
      />
      <span slot="tabs" style="width: 100%;">
        <NavTabBar :tabs="tabs" page="flow-run" />
      </span>
    </SubPageNav>

    <v-tabs-items
      v-model="tab"
      class="px-6 mx-auto tabs-border-bottom tab-full-height"
      :style="{
        'padding-top': $vuetify.breakpoint.smOnly ? '80px' : '130px'
      }"
      mandatory
    >
      <v-tab-item
        class="pa-0"
        value="overview"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayout>
          <TimelineTile
            v-if="flowId"
            slot="row-0"
            :flow-id="flowId"
            :flow-run-id="flowRunId"
            :flow-run-end-time="flowRun.end_time"
            :flow-run-scheduled-start-time="flowRun.scheduled_start_time"
            :flow-run-start-time="flowRun.start_time"
            :flow-run-state="flowRun.state"
            :flow-run-states="flowRun.states"
          />

          <DetailsTile
            slot="row-2-col-1-row-1-tile-1"
            :flow-run="flowRun"
            @refetch="handleRefetch"
          />

          <TaskRunHeartbeatTile
            slot="row-2-col-1-row-2-tile-1"
            :flow-run-id="$route.params.id"
          />

          <TaskRunTableTile
            slot="row-2-col-2-row-3-tile-1"
            :flow-run-id="flowRun.id"
          />
        </TileLayout>
      </v-tab-item>

      <v-tab-item
        value="schematic"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayoutFull>
          <SchematicTile slot="row-2-tile" />
        </TileLayoutFull>
      </v-tab-item>

      <v-tab-item
        class="tab-full-height"
        value="logs"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayoutFull>
          <LogsCard
            slot="row-2-tile"
            class="py-2 mt-4"
            entity="flow"
            :query="require('@/graphql/Logs/flow-run-logs.gql')"
            :query-for-scoping="
              require('@/graphql/Logs/flow-run-logs-scoping.gql')
            "
            query-key="flow_run_by_pk"
            :variables="{ id: $route.params.id }"
          />
        </TileLayoutFull>
      </v-tab-item>
    </v-tabs-items>

    <v-bottom-navigation v-if="$vuetify.breakpoint.smAndDown" app fixed>
      <v-btn @click="tab = 'overview'">
        Overview
        <v-icon>view_quilt</v-icon>
      </v-btn>

      <v-btn @click="tab = 'schematic'">
        Schematic
        <v-icon>pi-schematic</v-icon>
      </v-btn>

      <v-btn @click="tab = 'logs'">
        Logs
        <v-icon>format_align_left</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-sheet>
</template>

<style lang="scss" scoped>
.center-absolute {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>

<style lang="scss">
/* stylelint-disable */
.v-tab--disabled .v-badge__badge {
  pointer-events: none;
}

.v-badge--inline .v-badge__badge,
.v-badge--inline .v-badge__wrapper {
  margin: 5px;
}

.minTitleWidth {
  min-width: 20vw;
}
</style>
