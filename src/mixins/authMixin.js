import { authClient, authenticate } from '@/auth/authentication'

// const { VUE_APP_PUBLIC_CLIENT_ID, VUE_APP_PUBLIC_ISSUER } = process.env

export const authMixin = {
  data() {
    return {
      email: null,
      error: null,
      password: null
    }
  },
  methods: {
    async login() {
      const { token, success } = await authClient.signIn({
        username: this.username,
        password: this.password
      })
      if (!success) {
        this.error = 'Invalid username or password'
        return
      }
      authenticate(token)
      this.$router.push({ name: 'dashboard' })
    }
  }
}
