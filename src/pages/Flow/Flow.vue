<script>
/* eslint-disable */
import Actions from '@/pages/Flow/Actions'
import BreadCrumbs from '@/components/BreadCrumbs'
import NavTabBar from '@/components/NavTabBar'
import DetailsTile from '@/pages/Flow/Details-Tile'
import ErrorsTile from '@/pages/Flow/Errors-Tile'
import FlowRunHeartbeatTile from '@/pages/Flow/FlowRunHeartbeat-Tile'
import FlowRunTableTile from '@/pages/Flow/FlowRunTable-Tile'
import RunTiles from '@/pages/Flow/Run'
import SchematicTile from '@/pages/Flow/Schematic-Tile'
import SubPageNav from '@/layouts/SubPageNav'
import SummaryTile from '@/pages/Flow/Summary-Tile'
import DescribeTile from '@/pages/Flow/Describe'
import TasksTableTile from '@/pages/Flow/TasksTable-Tile'
import TileLayout from '@/layouts/TileLayout'
import TileLayoutFull from '@/layouts/TileLayout-Full'
import FlowRunHistoryTile from '@/pages/Flow/FlowRunHistory-Tile'
import UpcomingRunsTile from '@/pages/Flow/UpcomingRuns-Tile'
import VersionsTile from '@/pages/Flow/Versions-Tile'
import { mapActions } from 'vuex'

export default {
  metaInfo() {
    return {
      titleTemplate: `Flow | ${this.selectedFlow?.name ?? 'Prefect'}`
    }
  },
  components: {
    Actions,
    BreadCrumbs,
    DetailsTile,
    ErrorsTile,
    FlowRunHeartbeatTile,
    FlowRunTableTile,
    NavTabBar,
    RunTiles,
    SchematicTile,
    SubPageNav,
    SummaryTile,
    TasksTableTile,
    TileLayout,
    TileLayoutFull,
    FlowRunHistoryTile,
    UpcomingRunsTile,
    VersionsTile,
    DescribeTile
  },
  async beforeRouteLeave(to, from, next) {
    if (to.name == 'flow') {
      await this.activateFlow(to.params.id)
    } else {
      this.resetActiveData()
    }
    return next()
  },
  data() {
    return {
      loadingKey: 0,
      tabs: [
        {
          name: 'Overview',
          target: 'overview',
          icon: 'view_module'
        },
        {
          name: 'Tasks',
          target: 'tasks',
          icon: 'pi-task'
        },
        {
          name: 'Runs',
          target: 'runs',
          icon: 'pi-flow-run'
        },
        {
          name: 'Schematic',
          target: 'schematic',
          icon: 'pi-schematic'
        },
        {
          name: 'Run',
          target: 'run',
          icon: 'fa-rocket'
        },
      ]
    }
  },
  computed: {
    flowGroupId() {
      return this.$route.params.id
    },
    flows() {
      if (!this.flowGroup) return
      return [...this.flowGroup.flows].sort((a, b) => b.version - a.version)
    },
    flowVersionId() {
      return this.$route.query.version
    },
    latest() {
      if (!this.flowGroup) return
      return this.flows[0]
    },
    loading() {
      return this.loadingKey > 0
    },
    project() {
      if (!this.flowGroup) return
      return this.selectedFlow.project
    },
    selectedFlow() {
      if (!this.flowGroup) return
      if (!this.flowVersionId) return this.latest
      let flow = this.flowGroup.flows.find(f => f.version == this.flowVersionId)
      return flow ? flow : this.latest
    },
    versions() {
      if (!this.flowGroup) return
      let versions = this.flows.map((f, i) => {
        return {
          text: f.version + (i === 0 ? ' (latest)' : ''),
          value: f.version
        }
      })
      versions.unshift({ text: 'All', value: null })

      return versions
    },
    titleBarMaxWidth() {
      if (this.$vuetify.breakpoint.lgAndUp) {
        return '60vw'
      } else if (this.$vuetify.breakpoint.mdAndDown) {
        return '40vw'
      }
      return '30vw'
    },
    tab: {
      get(){
      const keys = Object.keys(this.$route.query ?? {})
      if (keys.length > 0 && this.tabs?.find(tab => tab.target == keys[0])) {
        return keys[0]
      }

      return 'overview'
      },
      set(value){
        this.$router.replace({query: { [value]: null }})
      }
    },
    flowTabs() {
      return this.tabs
    }
  },
  watch: {
    'this.$route.name'(val){
      if (val == 'flow') {
        this.activateFlow(this.$route.params.id)
      }
    }
  },
  async beforeMount() {
  await this.activateFlow(this.$route.params.id)
  },
  methods: {
    ...mapActions('data', ['activateFlow', 'resetActiveData']),
    onIntersect([entry]) {
      this.$apollo.queries.flowGroup.skip = !entry.isIntersecting
      this.$apollo.queries.lastFlowRun.skip = !entry.isIntersecting || !this.selectedFlow
    }
  },
  apollo: {
    flowGroup: {
      query() {
        return require('@/graphql/Flow/flow.js').default()
      },
      variables() {
        return {
          id: this.flowGroupId
        }
      },
      loadingKey: 'loadingKey',
      pollInterval: 5000,
      update: data => data?.flow_group_by_pk
    },
    lastFlowRun: {
      query: require('@/graphql/Flow/last-flow-run.gql'),
      variables() {
        return {
          id: this.selectedFlow.id
        }
      },
      loadingKey: 'loadingKey',
      pollInterval: 5000,
      update: data => data?.flow_run[0],
      skip() {
        return !this.selectedFlow
      }
    }
  }
}
</script>

<template>
  <v-sheet v-intersect="{ handler: onIntersect }" color="appBackground">
    <SubPageNav icon="pi-flow" page-type="Flow">
      <span
        slot="page-title"
        :style="
          !flowGroup
            ? {
                display: 'block',
                height: '28px',
                overflow: 'hidden',
                width: '400px'
              }
            : $vuetify.breakpoint.smAndDown && { display: 'inline' }
        "
      >
        <div
          v-if="flowGroup"
          class="text-truncate minTitleWidth"
          :style="{
            width: selectedFlow.name.length + 'ch',
            maxWidth: titleBarMaxWidth
          }"
        >
          {{ selectedFlow.name }}
          <span
            v-if="selectedFlow.archived"
            class="ml-1 text-body-1 grey--text"
          >
            (Archived)
          </span>
        </div>
        <div v-else style="width: 500px;">
          <v-skeleton-loader type="heading" tile></v-skeleton-loader>
        </div>
      </span>

      <span
        slot="breadcrumbs"
        :style="
          !flowGroup
            ? {
                height: '21px',
                overflow: 'hidden',
                width: '500px'
              }
            : $vuetify.breakpoint.smAndDown && {
                display: 'inline',
                'font-size': '0.875rem'
              }
        "
      >
        <BreadCrumbs
          v-if="flowGroup"
          slot="breadcrumbs"
          :crumbs="[
            {
              route: { name: 'project', params: { id: project.id } },
              text: project.name
            }
          ]"
        ></BreadCrumbs>
        <v-skeleton-loader v-else type="text" />
      </span>

      <Actions
        v-if="selectedFlow"
        slot="page-actions"
        style="height: 55px;"
        :archived="!!selectedFlow.archived"
        :flow="selectedFlow"
        :flow-group="flowGroup"
        :scheduled="selectedFlow.is_schedule_active"
        :versions="versions"
      />
      <span slot="tabs" style="width: 100%;"
        ><NavTabBar :tabs="flowTabs" v-if="flowGroup" page="flow"
      /></span>
    </SubPageNav>

    <v-tabs-items
      v-model="tab"
      v-if="flowGroup"
      class="px-6 mx-auto tabs-border-bottom tab-full-height"
      :style="{
        'padding-top': $vuetify.breakpoint.smOnly ? '80px' : '130px'
      }"
    >
      <v-tab-item
        class="pa-0"
        value="overview"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayout>
          <FlowRunHistoryTile
            slot="row-0"
            :aggregate="!flowVersionId"
            :flow="selectedFlow"
            :visible="tab == 'overview'"
          />

          <DetailsTile
            slot="row-1-col-1-tile-1"
            :flow="selectedFlow"
            :flow-group="flowGroup"
            :last-flow-run="lastFlowRun"
            full-height
          />

          <SummaryTile
            slot="row-1-col-2-tile-1"
            :aggregate="!flowVersionId"
            :flow="selectedFlow"
            full-height
          />

          <UpcomingRunsTile
            slot="row-1-col-3-tile-1"
            :aggregate="!flowVersionId"
            :flow="selectedFlow"
            :flow-group="flowGroup"
            full-height
          />

          <ErrorsTile
            slot="row-1-col-4-tile-1"
            :aggregate="!flowVersionId"
            :flow="selectedFlow"
            full-height
          />

          <FlowRunHeartbeatTile
            slot="row-2-col-1-row-2-tile-1"
            :aggregate="!flowVersionId"
            :flow="selectedFlow"
          />
        </TileLayout>
      </v-tab-item>

      <v-tab-item
        class="tab-full-height"
        value="tasks"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayoutFull>
          <TasksTableTile slot="row-2-tile" :flow="selectedFlow" />
        </TileLayoutFull>
      </v-tab-item>

      <v-tab-item
        value="runs"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayoutFull>
          <FlowRunTableTile
            slot="row-2-tile"
            :aggregate="!flowVersionId"
            :flow="selectedFlow"
          />
        </TileLayoutFull>
      </v-tab-item>

      <v-tab-item
        value="schematic"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayoutFull>
          <SchematicTile slot="row-2-tile" :flow="selectedFlow" />
        </TileLayoutFull>
      </v-tab-item>

      <v-tab-item
        value="description"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayoutFull>
          <DescribeTile
            slot="row-2a-tile"
            :fg-description="flowGroup.description"
            :flow-description="selectedFlow.description"
            :flow-group-id="flowGroup.id"
          />
        </TileLayoutFull>
      </v-tab-item>

      <v-tab-item
        value="versions"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <TileLayoutFull>
          <VersionsTile slot="row-2-tile" :flow-group-id="flowGroup.id" />
        </TileLayoutFull>
      </v-tab-item>

      <v-tab-item
        value="run"
        transition="tab-fade"
        reverse-transition="tab-fade"
      >
        <RunTiles
          v-if="tab == 'run'"
          :flow="selectedFlow"
          :flow-group="flowGroup"
        />
      </v-tab-item>
    </v-tabs-items>

    <v-bottom-navigation
      v-if="$vuetify.breakpoint.smAndDown"
      color="primary"
      app
      fixed
    >
      <v-btn :input-value="tab == 'overview'" @click="tab = 'overview'">
        Overview
        <v-icon>view_module</v-icon>
      </v-btn>

      <v-btn :input-value="tab == 'tasks'" @click="tab = 'tasks'">
        Tasks
        <v-icon>pi-task</v-icon>
      </v-btn>

      <v-btn :input-value="tab == 'runs'" @click="tab = 'runs'">
        Runs
        <v-icon>pi-flow-run</v-icon>
      </v-btn>

      <v-btn :input-value="tab == 'schematic'" @click="tab = 'schematic'">
        Schematic
        <v-icon>pi-schematic</v-icon>
      </v-btn>

      <v-btn :input-value="tab == 'run'" @click="tab = 'run'">
        Run
        <v-icon>fa-rocket</v-icon>
      </v-btn>

    </v-bottom-navigation>
  </v-sheet>
</template>

<style>
.minTitleWidth {
  min-width: 20vw;
}
</style>
