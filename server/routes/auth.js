const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = new User({ name, email, password })
    await user.save()

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Registration error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }

    res.status(500).json({ message: "Internal server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.json({
      message: "Login successful",
      token,
      user: user.toJSON(),
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  res.json({ user: req.user.toJSON() })
})

module.exports = router
