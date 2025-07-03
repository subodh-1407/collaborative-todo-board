"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LoginForm from "../components/auth/LoginForm"
import RegisterForm from "../components/auth/RegisterForm"

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-105">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">TaskFlow</h1>
            <p className="text-gray-600">Collaborative Task Management</p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                !isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Register
            </button>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  )
}

export default AuthPage
