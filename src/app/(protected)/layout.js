'use client'

import { useProtectedRoute } from '@/lib/auth'

export default function ProtectedLayout({ children }) {
  const { user, loading } = useProtectedRoute()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return children
}