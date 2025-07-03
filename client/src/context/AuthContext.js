"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { API_CONFIG } from "../config/api"

// Configure axios
axios.defaults.baseURL = API_CONFIG.baseURL
axios.defaults.timeout = API_CONFIG.timeout
axios.defaults.withCredentials = API_CONFIG.withCredentials

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.baseURL + config.url)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error("Response error:", error.response?.status, error.response?.data || error.message)
    return Promise.reject(error)
  },
)

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setUser(JSON.parse(userData))
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      console.log("Attempting login to:", axios.defaults.baseURL + "/api/auth/login")

      const response = await axios.post("/api/auth/login", { email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })

      let errorMessage = "Login failed"

      if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error - please check if the server is running"
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      console.log("Attempting registration to:", axios.defaults.baseURL + "/api/auth/register")

      const response = await axios.post("/api/auth/register", { name, email, password })
      const { token, user } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      return { success: true }
    } catch (error) {
      console.error("Registration error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      })

      let errorMessage = "Registration failed"

      if (error.code === "ERR_NETWORK") {
        errorMessage = "Network error - please check if the server is running"
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      return {
        success: false,
        message: errorMessage,
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
