const jwt = require("jsonwebtoken")
const User = require("../models/User")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ message: "Access token required" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(403).json({ message: "Invalid token" })
  }
}

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token

    if (!token) {
      return next(new Error("Authentication error"))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const user = await User.findById(decoded.userId)

    if (!user || !user.isActive) {
      return next(new Error("Authentication error"))
    }

    socket.userId = user._id.toString()
    socket.user = user
    next()
  } catch (error) {
    console.error("Socket auth error:", error)
    next(new Error("Authentication error"))
  }
}

module.exports = { authenticateToken, authenticateSocket }
