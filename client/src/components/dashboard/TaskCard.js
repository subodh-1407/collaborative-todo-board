"use client"

import { useState } from "react"
import { Edit2, Trash2, User, Zap, Clock } from "lucide-react"
import EditTaskModal from "./EditTaskModal"
import axios from "axios"

const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
}

const TaskCard = ({ task, users, currentUser, onUpdate, onSmartAssign }) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const assignedUser = users.find((u) => u._id === task.assignedTo)

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return

    try {
      await axios.delete(`/api/tasks/${task._id}`)
      onUpdate()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
    setTimeout(() => setIsFlipped(false), 2000)
  }

  return (
    <>
      <div
        className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform-gpu ${
          isFlipped ? "animate-flip" : ""
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-gray-800 flex-1 mr-2">{task.title}</h4>
          <div className="flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSmartAssign(task._id)
              }}
              className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors duration-200"
              title="Smart Assign"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowEditModal(true)
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {task.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            {assignedUser && (
              <div className="flex items-center space-x-1 text-xs text-gray-600">
                <User className="w-3 h-3" />
                <span>{assignedUser.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="w-3 h-3 mr-1" />
            {new Date(task.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditTaskModal task={task} users={users} onClose={() => setShowEditModal(false)} onUpdate={onUpdate} />
      )}
    </>
  )
}

export default TaskCard
