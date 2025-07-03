const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

const connectDB = require("./config/database")
const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/tasks")
const userRoutes = require("./routes/users")
const activityRoutes = require("./routes/activities")
const { authenticateSocket } = require("./middleware/auth")

const app = express()
const server = http.createServer(app)

// Define allowed origins
const allowedOrigins = [
  "https://collaborative-todo-board.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) // Remove any undefined values

console.log("Allowed CORS origins:", allowedOrigins)

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
})

// Connect to MongoDB
connectDB()

// Security middleware - Updated for CORS
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
)

// CORS configuration - FIXED
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        console.log("CORS blocked origin:", origin)
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  }),
)

// Handle preflight requests explicitly
app.options("*", cors())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: { message: "Too many requests from this IP, please try again later." },
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Collaborative Todo API is running!",
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
  })
})

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/users", userRoutes)
app.use("/api/activities", activityRoutes)

// Socket.IO connection handling
io.use(authenticateSocket)

io.on("connection", (socket) => {
  console.log(`User ${socket.userId} connected`)

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.userId} joined room ${roomId}`)
  })

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`)
  })
})

// Make io accessible to routes
app.set("io", io)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      details: Object.values(err.errors).map((e) => e.message),
    })
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" })
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong!",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

const PORT = process.env.PORT || 5000

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🔗 Allowed origins: ${allowedOrigins.join(", ")}`)
})

module.exports = { app, io }
