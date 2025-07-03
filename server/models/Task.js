const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: ["todo", "inprogress", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
taskSchema.index({ status: 1, createdAt: -1 })
taskSchema.index({ assignedTo: 1 })
taskSchema.index({ createdBy: 1 })

// Validate title uniqueness and column name conflicts
taskSchema.pre("save", async function (next) {
  const columnNames = ["todo", "inprogress", "done", "Todo", "In Progress", "Done"]

  if (columnNames.includes(this.title)) {
    const error = new Error("Task title cannot match column names")
    error.statusCode = 400
    return next(error)
  }

  // Check for duplicate titles
  if (this.isModified("title")) {
    const existingTask = await this.constructor.findOne({
      title: { $regex: new RegExp(`^${this.title}$`, "i") },
      _id: { $ne: this._id },
    })

    if (existingTask) {
      const error = new Error("Task title must be unique")
      error.statusCode = 400
      return next(error)
    }
  }

  next()
})

module.exports = mongoose.model("Task", taskSchema)
