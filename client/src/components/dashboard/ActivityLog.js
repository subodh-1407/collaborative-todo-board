import { Clock, User, Edit, Plus, Trash2, Move } from "lucide-react"

const ACTION_ICONS = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  moved: Move,
  assigned: User,
}

const ACTION_COLORS = {
  created: "text-green-600 bg-green-100",
  updated: "text-blue-600 bg-blue-100",
  deleted: "text-red-600 bg-red-100",
  moved: "text-purple-600 bg-purple-100",
  assigned: "text-orange-600 bg-orange-100",
}

const ActivityLog = ({ activities }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Activity Log
        </h3>
        <p className="text-sm text-gray-600 mt-1">Recent team activities</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No activities yet</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = ACTION_ICONS[activity.action] || Edit
            const colorClass = ACTION_COLORS[activity.action] || "text-gray-600 bg-gray-100"

            return (
              <div
                key={activity._id || index}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className={`p-2 rounded-full ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">
                    <span className="font-medium">{activity.userName}</span>{" "}
                    <span className="text-gray-600">{activity.description}</span>
                  </p>
                  {activity.taskTitle && (
                    <p className="text-xs text-gray-500 mt-1 truncate">Task: {activity.taskTitle}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ActivityLog
