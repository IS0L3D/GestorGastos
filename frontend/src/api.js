import axios from "axios"

const baseURL = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000/api"

const api = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access_token")
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem("refresh_token")

      if (refreshToken) {
        try {
          const tokenResponse = await axios.post(`${baseURL}/refresh/`, {
            refresh: refreshToken,
          })

          const newAccessToken = tokenResponse.data.access
          localStorage.setItem("access_token", newAccessToken)
          api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`

          return api(originalRequest)
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError)
          localStorage.removeItem("access_token")
          localStorage.removeItem("refresh_token")
          window.location.href = "/login"
          return Promise.reject(refreshError)
        }
      } else {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default api
