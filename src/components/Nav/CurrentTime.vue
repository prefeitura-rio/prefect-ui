<template>
  <div class="current-time">
    <span class="current-time__hour">{{ time.hour }}</span>
    <span class="current-time__separator">:</span>
    <span class="current-time__minute">{{ time.minute }}</span>
    <span class="current-time__meridian">{{ time.meridian }}</span>
    <v-tooltip top>
      <template #activator="{ on }">
        <v-icon class="material-icons-outlined" x-small v-on="on">
          info
        </v-icon>
      </template>
      System time according to your IP's timezone
    </v-tooltip>
  </div>
</template>

<script>
import { formatTime } from '@/mixins/formatTimeMixin'
import { getMillisecondsUntilNextMinute } from '@/utils/dateTime'

export default {
  mixins: [formatTime],
  data() {
    return {
      clockTimeout: null,
      clockInterval: null,
      time: null
    }
  },
  created() {
    this.setTime()
    this.triggerSetTimeIntervalAtNextMinute()
  },
  destroyed() {
    clearInterval(this.clockInterval)
  },
  methods: {
    setTime() {
      this.time = this.dateParts(Date.now())
    },
    triggerSetTimeIntervalAtNextMinute() {
      const millisecondsUntilNextMinute = getMillisecondsUntilNextMinute()

      this.clockInterval = setTimeout(
        this.setTimeOnMinuteInterval,
        millisecondsUntilNextMinute
      )
    },
    setTimeOnMinuteInterval() {
      this.setTime()
      this.clockInterval = setInterval(this.setTime, 60000)
    }
  }
}
</script>

<style lang="scss" scoped>
.current-time__separator {
  color: var(--v-utilGrayDark-base);
}

.current-time__meridian {
  color: var(--v-utilGrayDark-base);
  font-size: 0.75rem;
  line-height: 2rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding-left: 8px;
  padding-right: 4px;
}
</style>
