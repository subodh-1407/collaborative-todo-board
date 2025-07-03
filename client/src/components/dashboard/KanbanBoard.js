"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import TaskCard from "./TaskCard"
import AddTaskForm from "./AddTaskForm"
import ConflictModal from "./ConflictModal"
import { Plus } from "lucide-react"
import axios from "axios"

const COLUMNS = {
  todo: { id: "todo", title: "Todo", color: "bg-gray-100" },
  inprogress: { id: "inprogress", title: "In Progress", color: "bg-blue-100" },
  done: { id: "done", title: "Done", color: "bg-green-100" },
}

const KanbanBoard = ({ tasks, users, socket, currentUser, onTaskUpdate }) => {
  const [showAddForm, setShowAddForm] = useState("")
  const [conflictData, setConflictData] = useState(null)
  const [tasksByColumn, setTasksByColumn] = useState({
    todo: [],
    inprogress: [],
    done: [],
  })
  const [isDragDisabled, setIsDragDisabled] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const grouped = {
      todo: tasks.filter((task) => task.status === "todo"),
      inprogress: tasks.filter((task) => task.status === "inprogress"),
      done: tasks.filter((task) => task.status === "done"),
    }
    setTasksByColumn(grouped)

    // Ensure DOM is ready for drag and drop
    const timer = setTimeout(() => setIsReady(true), 150)
    return () => clearTimeout(timer)
  }, [tasks])

  const handleDragStart = () => {
    setIsDragDisabled(false)
  }

  const handleDragEnd = async (result) => {
    if (!result.destination || isDragDisabled) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const task = tasks.find((t) => t._id === draggableId)
    if (!task) return

    const newStatus = destination.droppableId

    setIsDragDisabled(true)

    try {
      await axios.put(`/api/tasks/${task._id}`, {
        ...task,
        status: newStatus,
      })
      onTaskUpdate()
    } catch (error) {
      console.error("Error updating task:", error)
    } finally {
      setTimeout(() => setIsDragDisabled(false), 500)
    }
  }

  const handleSmartAssign = async (taskId) => {
    try {
      await axios.post(`/api/tasks/${taskId}/smart-assign`)
      onTaskUpdate()
    } catch (error) {
      console.error("Error smart assigning task:", error)
    }
  }

  if (!isReady) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(COLUMNS).map((column) => (
            <div key={column.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className={`${column.color} px-4 py-3 rounded-t-lg border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                      Loading...
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 min-h-[200px] flex items-center justify-center">
                <div className="spinner"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(COLUMNS).map((column) => (
            <div key={column.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className={`${column.color} px-4 py-3 rounded-t-lg border-b border-gray-200`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                      {tasksByColumn[column.id]?.length || 0}
                    </span>
                    <button
                      onClick={() => setShowAddForm(column.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-50 rounded transition-colors duration-200"
                      disabled={isDragDisabled}
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 min-h-[200px] transition-colors duration-200 ${
                      snapshot.isDraggingOver ? "bg-gray-50" : ""
                    }`}
                  >
                    {tasksByColumn[column.id]?.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index} isDragDisabled={isDragDisabled}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 transition-transform duration-200 ${
                              snapshot.isDragging ? "rotate-3 scale-105 z-50" : ""
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style?.transform} rotate(3deg)`
                                : provided.draggableProps.style?.transform,
                            }}
                          >
                            <TaskCard
                              task={task}
                              users={users}
                              currentUser={currentUser}
                              onUpdate={onTaskUpdate}
                              onSmartAssign={handleSmartAssign}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {showAddForm === column.id && (
                      <AddTaskForm
                        status={column.id}
                        users={users}
                        onClose={() => setShowAddForm("")}
                        onTaskCreated={onTaskUpdate}
                      />
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {conflictData && (
        <ConflictModal
          conflictData={conflictData}
          onResolve={() => {
            setConflictData(null)
            onTaskUpdate()
          }}
          onClose={() => setConflictData(null)}
        />
      )}
    </div>
  )
}

export default KanbanBoard
