const express = require("express")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get all active users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select("-password").sort({ name: 1 })

    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select("-password")
    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
