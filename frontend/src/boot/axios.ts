import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { authManager } from 'src/services'



const api = axios.create({
  baseURL: 'http://localhost:3333', // adonis backend
  withCredentials: true,
  headers: {}
})

const DEBUG = process.env.NODE_ENV === 'development'

// add interceptor to add authorization header for api calls
api.interceptors.request.use(
  (config) => {
    const token = authManager.getToken()

    // ensure headers object exists
    config.headers = config.headers || {}

    if (token !== null) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (DEBUG) {
      console.info('-> ', config)
    }

    return config
  },
  (error) => {
    if (DEBUG) {
      console.error('-> ', error)
    }

    return error
  }
)

// add interceptor for response to trigger logout
api.interceptors.response.use(
  (response) => {
    if (DEBUG) {
      console.info('<- ', response)
    }

    return response
  },
  (error) => {
    if (DEBUG) {
      console.error('<- ', error.response)
    }

    // server api request returned unathorized response so we trrigger logout
    if (error.response.status === 401 && !error.response.config.dontTriggerLogout) {
      authManager.logout()
    }

    return error
  }
)

// ak máme token v localStorage, pridaj ho do headrov
const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
