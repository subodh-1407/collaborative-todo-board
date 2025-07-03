"use client"

import { useState } from "react"
import { X } from "lucide-react"
import axios from "axios"

const AddTaskForm = ({ status, users, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await axios.post("/api/tasks", {
        ...formData,
        status,
      })
      onTaskCreated()
      onClose()
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 animate-slideIn">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">Add New Task</h4>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Task title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          required
        />

        <textarea
          placeholder="Description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
          rows={2}
        />

        <div className="grid grid-cols-2 gap-2">
          <select
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>

          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddTaskForm
