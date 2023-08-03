<script>
import { authMixin } from '@/mixins/authMixin.js'

export default {
  mixins: [authMixin],
  data() {
    return {
      autofilled: false,
      form: null,
      username: null,
    }
  },
  mounted() {
    this.$refs.username.$el
      .querySelector('input')
      .addEventListener('animationstart', this.focus)
    this.$refs.password.$el
      .querySelector('input')
      .addEventListener('animationstart', this.focus)
  },
  methods: {
    focus(e) {
      switch (e.animationName) {
        case 'onAutoFillStart':
          this.autofilled = true
          this.$refs.username.focus()
          break
        case 'onAutoFillCancel':
          this.autofilled = false
          break
      }
    }
  }
}
</script>

<template>
  <v-container fluid>
    <div
      class="text-subtitle-1 my-4 font-weight-bold text-center grey--text text--darken-2"
    >
      Sign in
    </div>

    <v-form
      v-model="form"
      class="text-center"
      :class="error ? 'mb-5' : 'mb-8'"
      @submit.prevent="login"
      @keyup.enter="login"
    >
      <div class="my-4">
        <v-text-field
          ref="username"
          v-model="username"
          class="arboria autofillable-input"
          outlined
          type="username"
          label="Username"
          :placeholder="autofilled ? ' ' : null"
          hide-details
          autocomplete="username"
          prepend-inner-icon="fa-user"
        />
      </div>
      <div class="mt-4 mb-2">
        <v-text-field
          ref="password"
          v-model="password"
          class="arboria mb-0 autofillable-input"
          outlined
          type="password"
          label="Password"
          :placeholder="autofilled ? ' ' : null"
          hide-details
          autocomplete="current-password"
          prepend-inner-icon="lock"
        />
      </div>

      <v-btn
        block
        depressed
        color="primary"
        class="btn btn-primary btn-block mt-6 pa-3"
        height="45"
        type="submit"
      >
        Continue
      </v-btn>
    </v-form>

    <div v-if="error" class="mt-2 alert error--text arboria text-center">
      {{ error }}
    </div>

  </v-container>
</template>

<style lang="scss">
// This method was developed by the Klarna UI team to
// "hack" the autofill bug in Chromium...
// I've adapted it to Vue and made some modifications for
// Vuetify.
.autofillable-input {
  input:-webkit-autofill {
    // Expose a hook for JavaScript when auto fill is shown.
    // JavaScript can capture 'animationstart' events
    animation-name: onAutoFillStart;

    // Make the backgound color become yellow _really slowly_
    transition: background-color 50000s ease-in-out 0s;
  }

  input:not(:-webkit-autofill) {
    // Expose a hook for JS onAutoFillCancel
    // JavaScript can capture 'animationstart' events
    animation-name: onAutoFillCancel;
  }
}

// stylelint-disable
@keyframes onAutoFillStart {
  from {
    /**/
  }
  to {
    /**/
  }
}

@keyframes onAutoFillCancel {
  from {
    /**/
  }
  to {
    /**/
  }
}
// stylelint-enable
</style>
