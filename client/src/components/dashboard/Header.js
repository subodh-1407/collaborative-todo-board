"use client"
import { useAuth } from "../../context/AuthContext"
import { Activity, LogOut, User } from "lucide-react"

const Header = ({ user, onToggleActivityLog, showActivityLog }) => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">TaskFlow</h1>
          <div className="text-sm text-gray-600">Welcome back, {user.name}!</div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleActivityLog}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              showActivityLog ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity</span>
          </button>

          <div className="flex items-center space-x-2 text-gray-600">
            <User className="w-4 h-4" />
            <span className="text-sm">{user.email}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
