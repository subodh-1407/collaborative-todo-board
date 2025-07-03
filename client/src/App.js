"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import AuthPage from "./pages/AuthPage"
import Dashboard from "./pages/Dashboard"
import { AuthProvider, useAuth } from "./context/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return user ? children : <Navigate to="/" />
}

export default App
