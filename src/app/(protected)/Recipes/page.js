'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import RecipeCard from '@/app/components/recipes/RecipeCard'

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch recipes')
      const data = await response.json()
      setRecipes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="container mx-auto">
          <div className="flex justify-center items-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Recipes</h1>
          <Link href="/recipes/new" className="btn btn-primary">
            Create Recipe
          </Link>
        </div>

        {error ? (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl mb-4">No recipes yet</h3>
            <p className="text-base-content/70 mb-6">Create your first recipe to get started</p>
            <Link href="/recipes/new" className="btn btn-primary">
              Create Recipe
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
