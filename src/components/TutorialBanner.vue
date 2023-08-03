<script>
import ExternalLink from '@/components/ExternalLink'
export default {
  components: { ExternalLink },
  props: {
    pageScroll: {
      type: Boolean,
      required: false,
      default: () => false
    }
  },
  data() {
    return {
      dismissed: false
    }
  },
}
</script>

<template>
  <v-banner :value="!dismissed">
    <template #default>
      <div class="d-flex align-center">
        <v-avatar slot="icon" color="primary" size="40">
          <v-icon icon="mdi-lock" color="white">
            school
          </v-icon>
        </v-avatar>
        <div class="ml-4">
          Pst! It looks like you don't have any flows yet;
          <span>
            check out our
            <ExternalLink href="https://docs.prefect.io/">
              documentation
            </ExternalLink>
            for help on getting started.
          </span>
        </div>
        <v-btn
          class="ml-auto"
          width="40"
          height="40"
          icon
          text
          dark
          color="error"
          @click="dismissed = !dismissed"
        >
          <v-icon>
            close
          </v-icon>
        </v-btn>
      </div>
    </template>
  </v-banner>
</template>
