const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["created", "updated", "deleted", "moved", "assigned"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    taskTitle: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
activitySchema.index({ createdAt: -1 })
activitySchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model("Activity", activitySchema)
