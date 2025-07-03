// API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "https://collaborative-todo-board.onrender.com" : "http://localhost:5000")

console.log("API Base URL:", API_BASE_URL)
console.log("Environment:", process.env.NODE_ENV)

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for Render cold starts
  withCredentials: true,
}

export default API_CONFIG
