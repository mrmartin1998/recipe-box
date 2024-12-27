'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check initial auth state
    const token = localStorage.getItem('token')
    const userEmail = localStorage.getItem('userEmail')
    if (token && userEmail) {
      setIsLoggedIn(true)
      setUser({ email: userEmail })
    }
  }, [])

  const login = (email, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userEmail', email)
    setIsLoggedIn(true)
    setUser({ email })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 