<script>
import { mapGetters } from 'vuex'
import MenuTooltip from '@/components/MenuTooltip'

export default {
  components: {
    MenuTooltip
  },
  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: () => false
    },
    hideDetails: {
      type: Boolean,
      required: false,
      default: () => false
    }
  },
  data() {
    return {
      volumeDiscounts: [
        { runs: '20,000', price: 'Free' },
        { runs: '100,000', price: '$0.0025' },
        { runs: '1,000,000', price: '$0.00125' },
        { runs: '10,000,000', price: '$0.000625' },
        { runs: '100,000,000', price: '$0.0003125' },
        { runs: '...and up', price: '' }
      ]
    }
  },
  computed: {
    ...mapGetters('license', ['license', 'planType'])
  },
  methods: {
    select() {
      if (this.planType('STARTER') || this.disabled) return
      this.$emit('click')
    }
  }
}
</script>

<template>
  <div
    class="plan-card blue-grey darken-2 white--text mt-8 rounded elevation-4"
  >
    <div class="font-weight-regular text-center py-8 plan-title">
      Starter
    </div>
    <v-divider class="divider-light" />
    <div
      class="text-h6 text-md-subtitle-1 text-lg-h6 font-weight-regular text-center grey--text text--lighten-3"
    >
      <div class="px-4">
        <MenuTooltip hide-close>
          <template #activator>
            <div
              class="mt-12 ml-4 text-h2 font-weight-regular white--text plan-task-run-price d-flex align-center justify-center"
            >
              <span class="mr-2 font-weight-light d-inline-block plan-cent">
                $ </span
              >0.0025

              <span class="mx-1 font-weight-light text-h5 align-self-end mr-n1"
                >/
              </span>
              <div
                class="ml-2 font-weight-light text-body-2 align-self-end text-left"
              >
                <div>successful</div>
                <div style="margin-top: -6px;">
                  <span>
                    task run
                  </span>
                </div>
              </div>
            </div>

            <div class="font-weight-regular">
              +

              <a class="primary--text text--lighten-1 volume-link"
                >automatic volume discounts</a
              >
            </div></template
          >
          <div>
            <div class="text-h6 font-weight-regular">
              Only pay for successful runs.
            </div>
            <div class="mt-4 text-subtitle-1 font-weight-light">
              There's no charge for retries, failures, or any task that runs in
              less than one second.
            </div>
            <div class="mt-4 text-subtitle-1 font-weight-light">
              As usage increases each month, the price per run automatically
              drops:
            </div>
            <div class="mt-4 text-subtitle-1 font-weight-light">
              <v-simple-table dense>
                <thead>
                  <tr>
                    <th class="text-left font-weight-light text-subtitle-1">
                      Monthly run tier
                    </th>
                    <th class="text-left font-weight-light text-subtitle-1">
                      Price per run
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in volumeDiscounts" :key="item.runs">
                    <td class="font-weight-light">
                      <span v-if="i == 0" class="text-subtitle-1"
                        >0 <span class="text-caption">to </span></span
                      >

                      <span
                        v-if="i !== 0 && i !== volumeDiscounts.length - 1"
                        class="text-caption"
                        >then to
                      </span>

                      <span class="text-subtitle-1">{{ item.runs }}</span>
                    </td>
                    <td class="text-subtitle-1 font-weight-light">{{
                      item.price
                    }}</td>
                  </tr>
                </tbody>
              </v-simple-table>
            </div>
          </div>
        </MenuTooltip>

        <div
          class="my-12 my-md-8 my-lg-12 text-left plan-body d-flex align-start justify-center flex-column"
        >
          <div class="d-flex align-center justify-center">
            <span class="rounded-circle plans-feature-icon">
              <v-icon small>
                fad fa-tasks
              </v-icon>
            </span>
            <span class="ml-2">
              20,000 free runs every month
            </span>
          </div>

          <div class="mt-3 d-flex align-center justify-center">
            <span
              class="rounded-circle plans-feature-icon plans-feature-icon-light"
            >
              <v-icon small>
                fad fa-users
              </v-icon>
            </span>
            <span class="ml-2">Up to 1 user</span>
          </div>

          <div class="mt-3 d-flex align-center justify-center">
            <span
              class="rounded-circle plans-feature-icon plans-feature-icon-light"
            >
              <v-icon small>
                fad fa-history
              </v-icon>
            </span>
            <span class="ml-2">1 week of run history</span>
          </div>
        </div>
      </div>

      <div v-if="hideDetails" class="py-7 mt-8 mt-md-6 mt-lg-8 o-0">
        {{
          planType('STARTER')
            ? 'Current'
            : disabled
            ? 'Contact your team admin to upgrade'
            : 'Start for free'
        }}
      </div>

      <div
        v-else
        class="plan-cta plan-cta-dark py-7 mt-8 mt-md-6 mt-lg-8"
        :class="{ 'cursor-pointer': !planType('STARTER') }"
        @click="select"
      >
        {{
          planType('STARTER')
            ? 'Current'
            : disabled
            ? 'Contact your team admin to upgrade'
            : 'Start for free'
        }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.plan-card {
  height: min-content;
  overflow: hidden;
  transition: all 150ms;
  width: 425px;

  .plan-title {
    font-size: 1.15rem;
    letter-spacing: 0.15rem;
    text-transform: uppercase;
  }

  .divider-dark {
    border-color: #eee;
  }

  .divider-light {
    border-color: #3f515a;
  }

  .plan-body {
    font-weight: 300 !important;
    margin: auto;
    max-width: 375px;
    width: max-content;
  }

  .plan-feature-icon {
    align-items: center;
    display: inline-flex;
    height: 20px;
    justify-content: center;
    width: 20px;
  }

  .plan-task-run-price {
    font-size: 4.5rem !important;
  }

  .volume-link {
    // text-decoration: dotted;
    border-bottom: dotted 1.75px;
  }

  .plan-cent {
    font-size: 3rem !important;
    vertical-align: middle;
  }

  .plan-table {
    column-gap: 2px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 2px;

    div {
      background-color: #455a64;
    }
  }

  .plan-cta {
    background-color: #f7fcfd;
    color: inherit !important;
    display: block;
    font-size: 1rem;
    letter-spacing: 0.15rem;
    text-decoration: none;
    text-transform: uppercase;
    transition: all 50ms;

    &.plan-cta-dark {
      background-color: #546e7a;

      &:focus,
      &:hover {
        background-color: #5a7581 !important;
        color: #fff;
      }
    }

    &:focus,
    &:hover {
      background-color: #e9f7fc !important;
      font-weight: 500 !important;
    }
  }
}

.feature-divider {
  border-color: #cfd8dc;
  margin: auto;
  width: 30%;
}
</style>
