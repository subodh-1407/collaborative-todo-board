const express = require("express")
const Task = require("../models/Task")
const User = require("../models/User")
const Activity = require("../models/Activity")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Apply authentication to all routes
router.use(authenticateToken)

// Helper function to log activity
const logActivity = async (action, userId, userName, taskId, taskTitle, description, metadata = {}) => {
  try {
    const activity = new Activity({
      action,
      userId,
      userName,
      taskId,
      taskTitle,
      description,
      metadata,
    })
    await activity.save()

    // Emit to all connected clients
    const io = require("../server").io
    io.emit("activityAdded", activity)
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Create new task
router.post("/", async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body

    const task = new Task({
      title,
      description,
      status: status || "todo",
      priority: priority || "medium",
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
    })

    await task.save()
    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    // Log activity
    await logActivity("created", req.user._id, req.user.name, task._id, task.title, `created task "${task.title}"`)

    // Emit to all connected clients
    const io = req.app.get("io")
    io.emit("taskCreated", task)

    res.status(201).json(task)
  } catch (error) {
    console.error("Error creating task:", error)

    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }

    res.status(500).json({ message: "Internal server error" })
  }
})

// Update task
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Store old values for activity logging
    const oldStatus = task.status
    const oldAssignedTo = task.assignedTo

    // Update task
    Object.assign(task, updates)
    task.lastEditedBy = req.user._id
    task.version += 1

    await task.save()
    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    // Log activity based on what changed
    let activityDescription = `updated task "${task.title}"`
    let action = "updated"

    if (oldStatus !== task.status) {
      activityDescription = `moved task "${task.title}" from ${oldStatus} to ${task.status}`
      action = "moved"
    } else if (oldAssignedTo?.toString() !== task.assignedTo?.toString()) {
      const assignedUser = await User.findById(task.assignedTo)
      activityDescription = `assigned task "${task.title}" to ${assignedUser ? assignedUser.name : "unassigned"}`
      action = "assigned"
    }

    await logActivity(action, req.user._id, req.user.name, task._id, task.title, activityDescription)

    // Emit to all connected clients
    const io = req.app.get("io")
    io.emit("taskUpdated", task)

    res.json(task)
  } catch (error) {
    console.error("Error updating task:", error)

    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({ message: messages.join(", ") })
    }

    res.status(500).json({ message: "Internal server error" })
  }
})

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    await Task.findByIdAndDelete(id)

    // Log activity
    await logActivity("deleted", req.user._id, req.user.name, task._id, task.title, `deleted task "${task.title}"`)

    // Emit to all connected clients
    const io = req.app.get("io")
    io.emit("taskDeleted", id)

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Smart assign task
router.post("/:id/smart-assign", async (req, res) => {
  try {
    const { id } = req.params

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Get all users and their active task counts
    const users = await User.find({ isActive: true })
    const activeTasks = await Task.find({ status: { $ne: "done" } })

    const userTaskCounts = users.map((user) => ({
      userId: user._id,
      userName: user.name,
      taskCount: activeTasks.filter((t) => t.assignedTo?.toString() === user._id.toString()).length,
    }))

    // Sort by task count (ascending) and pick the first one
    userTaskCounts.sort((a, b) => a.taskCount - b.taskCount)
    const assignedUser = userTaskCounts[0]

    if (!assignedUser) {
      return res.status(400).json({ message: "No available users for assignment" })
    }

    // Update task
    task.assignedTo = assignedUser.userId
    task.lastEditedBy = req.user._id
    task.version += 1

    await task.save()
    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    // Log activity
    await logActivity(
      "assigned",
      req.user._id,
      req.user.name,
      task._id,
      task.title,
      `smart-assigned task "${task.title}" to ${assignedUser.userName}`,
    )

    // Emit to all connected clients
    const io = req.app.get("io")
    io.emit("taskUpdated", task)

    res.json(task)
  } catch (error) {
    console.error("Error smart assigning task:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Resolve conflict
router.post("/:id/resolve-conflict", async (req, res) => {
  try {
    const { id } = req.params
    const { resolvedVersion, conflictId } = req.body

    const task = await Task.findById(id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Update task with resolved version
    Object.assign(task, resolvedVersion)
    task.lastEditedBy = req.user._id
    task.version += 1

    await task.save()
    await task.populate("assignedTo", "name email")
    await task.populate("createdBy", "name email")

    // Log activity
    await logActivity(
      "updated",
      req.user._id,
      req.user.name,
      task._id,
      task.title,
      `resolved conflict for task "${task.title}"`,
    )

    // Emit to all connected clients
    const io = req.app.get("io")
    io.emit("taskUpdated", task)

    res.json(task)
  } catch (error) {
    console.error("Error resolving conflict:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

module.exports = router
