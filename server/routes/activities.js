const express = require("express")
const Activity = require("../models/Activity")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Get last 20 activities
router.get("/", async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("userId", "name email")
      .populate("taskId", "title")

    res.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
