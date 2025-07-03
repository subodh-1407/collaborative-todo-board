"use client"

import { useState } from "react"
import { AlertTriangle, X } from "lucide-react"
import axios from "axios"

const ConflictModal = ({ conflictData, onResolve, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState("current")
  const [loading, setLoading] = useState(false)

  const handleResolve = async () => {
    setLoading(true)

    try {
      const versionToKeep = selectedVersion === "current" ? conflictData.currentVersion : conflictData.incomingVersion

      await axios.post(`/api/tasks/${conflictData.taskId}/resolve-conflict`, {
        resolvedVersion: versionToKeep,
        conflictId: conflictData.conflictId,
      })

      onResolve()
    } catch (error) {
      console.error("Error resolving conflict:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Conflict Detected</h3>
              <p className="text-sm text-gray-600">Multiple users edited the same task</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">Choose which version to keep. The other version will be discarded.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedVersion === "current" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedVersion("current")}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Your Version</h4>
                <input
                  type="radio"
                  checked={selectedVersion === "current"}
                  onChange={() => setSelectedVersion("current")}
                  className="text-blue-600"
                />
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Title:</strong> {conflictData.currentVersion?.title}
                </p>
                <p>
                  <strong>Description:</strong> {conflictData.currentVersion?.description || "None"}
                </p>
                <p>
                  <strong>Status:</strong> {conflictData.currentVersion?.status}
                </p>
                <p>
                  <strong>Priority:</strong> {conflictData.currentVersion?.priority}
                </p>
              </div>
            </div>

            <div
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedVersion === "incoming" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedVersion("incoming")}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-800">Other User's Version</h4>
                <input
                  type="radio"
                  checked={selectedVersion === "incoming"}
                  onChange={() => setSelectedVersion("incoming")}
                  className="text-blue-600"
                />
              </div>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Title:</strong> {conflictData.incomingVersion?.title}
                </p>
                <p>
                  <strong>Description:</strong> {conflictData.incomingVersion?.description || "None"}
                </p>
                <p>
                  <strong>Status:</strong> {conflictData.incomingVersion?.status}
                </p>
                <p>
                  <strong>Priority:</strong> {conflictData.incomingVersion?.priority}
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleResolve}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? "Resolving..." : "Resolve Conflict"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal
