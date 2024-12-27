'use client'

export default function Dashboard() {
  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-4">Welcome to Recipe Box</h1>
        <p className="text-lg mb-4">Your personal recipe management system</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Recipes</h2>
              <p>Manage your favorite recipes</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Shopping Lists</h2>
              <p>Create and manage shopping lists</p>
            </div>
          </div>
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Meal Plans</h2>
              <p>Plan your meals for the week</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
