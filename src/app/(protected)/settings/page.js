'use client'

export default function Settings() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Settings</h1>
        
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Preferences</h2>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Email Notifications</span>
                  <input type="checkbox" className="toggle" />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Dark Mode</span>
                  <input type="checkbox" className="toggle" defaultChecked />
                </label>
              </div>
            </div>

            <div className="divider"></div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Display</h2>
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">Temperature Unit</span>
                </label>
                <select className="select select-bordered">
                  <option>Celsius</option>
                  <option>Fahrenheit</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 