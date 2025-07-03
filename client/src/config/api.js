// API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://your-backend-service.onrender.com" // Replace with your Render URL
    : "http://localhost:5000")

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
}

export default API_CONFIG
