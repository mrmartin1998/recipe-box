'use client'

import { useAuth } from '@/app/contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <div className="flex items-center gap-4 mb-6">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-24">
                  <span className="text-3xl">{user?.email?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                <p className="text-base-content/70">{user?.email}</p>
              </div>
            </div>

            <div className="divider"></div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Account Information</h3>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-base-content/70">Email</span>
                  <span>{user?.email}</span>
                  <span className="text-base-content/70">Member Since</span>
                  <span>January 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 