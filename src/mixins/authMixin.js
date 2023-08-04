import { authClient, authenticate } from '@/auth/authentication'

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
