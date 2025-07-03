"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import Header from "../components/dashboard/Header"
import KanbanBoard from "../components/dashboard/KanbanBoard"
import ActivityLog from "../components/dashboard/ActivityLog"
import { io } from "socket.io-client"
import axios from "axios"
import { API_CONFIG } from "../config/api"

const Dashboard = () => {
  const { user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [showActivityLog, setShowActivityLog] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_CONFIG.baseURL, {
      auth: { token: localStorage.getItem("token") },
      transports: ["websocket", "polling"],
    })

    newSocket.on("connect", () => {
      console.log("Connected to server")
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    newSocket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)))
    })

    newSocket.on("taskCreated", (newTask) => {
      setTasks((prev) => [...prev, newTask])
    })

    newSocket.on("taskDeleted", (taskId) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId))
    })

    newSocket.on("activityAdded", (activity) => {
      setActivities((prev) => [activity, ...prev.slice(0, 19)])
    })

    setSocket(newSocket)

    // Fetch initial data
    fetchTasks()
    fetchUsers()
    fetchActivities()

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get("/api/tasks")
      setTasks(response.data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users")
      setUsers(response.data)
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await axios.get("/api/activities")
      setActivities(response.data)
    } catch (error) {
      console.error("Error fetching activities:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onToggleActivityLog={() => setShowActivityLog(!showActivityLog)}
        showActivityLog={showActivityLog}
      />

      <div className="flex">
        <div className={`flex-1 transition-all duration-300 ${showActivityLog ? "mr-80" : ""}`}>
          <KanbanBoard tasks={tasks} users={users} socket={socket} currentUser={user} onTaskUpdate={fetchTasks} />
        </div>

        {showActivityLog && (
          <div className="fixed right-0 top-16 h-full w-80 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300">
            <ActivityLog activities={activities} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
