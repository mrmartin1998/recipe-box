'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewRecipe() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [ingredients, setIngredients] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([
    { name: '', amount: 1, unit: '', notes: '', category: 'other' }
  ])
  const [suggestedIngredients, setSuggestedIngredients] = useState({})
  
  const [recipe, setRecipe] = useState({
    name: '',
    description: '',
    servings: 4,
    prepTime: 15,
    cookTime: 30,
    difficulty: 'medium'
  })

  const [steps, setSteps] = useState([
    { description: '', timer: 0, notes: '' }
  ])

  const searchSimilarIngredients = async (index, name) => {
    if (name.length < 2) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/ingredients?search=${encodeURIComponent(name)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch suggestions')
      const data = await response.json()
      setSuggestedIngredients({...suggestedIngredients, [index]: data.ingredients})
    } catch (err) {
      console.error('Failed to fetch suggestions:', err)
    }
  }

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...selectedIngredients]
    if (field === 'amount') {
      value = parseFloat(value) || 0 // Ensure we always have a valid number
    }
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setSelectedIngredients(newIngredients)
    
    if (field === 'name') {
      searchSimilarIngredients(index, value)
    }
  }

  const addIngredient = () => {
    setSelectedIngredients([
      ...selectedIngredients,
      { name: '', amount: 1, unit: '', notes: '', category: 'other' }
    ])
  }

  const removeIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index))
  }

  const addStep = () => {
    setSteps([...steps, { description: '', timer: 0, notes: '' }])
  }

  const updateStep = (index, field, value) => {
    const newSteps = [...steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setSteps(newSteps)
  }

  const removeStep = (index) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const moveStep = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === steps.length - 1)
    ) return

    const newSteps = [...steps]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]]
    setSteps(newSteps)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...recipe,
          ingredients: ingredients.map(ing => ({
            item: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            notes: ing.notes,
            category: ing.category
          })),
          steps: steps.map((step, index) => ({
            order: index + 1,
            description: step.description,
            timer: step.timer,
            notes: step.notes
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to create recipe')
      
      const data = await response.json()
      router.push(`/recipes/${data.recipe._id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleIngredientSelect = (index, suggestion) => {
    handleIngredientChange(index, 'name', suggestion.name)
    handleIngredientChange(index, 'category', suggestion.category)
    handleIngredientChange(index, 'unit', suggestion.defaultUnit || '')
    
    setSuggestedIngredients(prev => {
      const newSuggestions = { ...prev }
      delete newSuggestions[index]
      return newSuggestions
    })
  }

  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestedIngredients({})
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <main className="min-h-screen p-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Create New Recipe</h1>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Recipe Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered"
              value={recipe.name}
              onChange={(e) => setRecipe({...recipe, name: e.target.value})}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={recipe.description}
              onChange={(e) => setRecipe({...recipe, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Servings</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={recipe.servings}
                onChange={(e) => setRecipe({...recipe, servings: parseInt(e.target.value)})}
                required
                min="1"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Difficulty</span>
              </label>
              <select 
                className="select select-bordered"
                value={recipe.difficulty}
                onChange={(e) => setRecipe({...recipe, difficulty: e.target.value})}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Prep Time (mins)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={recipe.prepTime}
                onChange={(e) => setRecipe({...recipe, prepTime: parseInt(e.target.value)})}
                min="0"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Cook Time (mins)</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={recipe.cookTime}
                onChange={(e) => setRecipe({...recipe, cookTime: parseInt(e.target.value)})}
                min="0"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Ingredients</h2>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={addIngredient}
              >
                Add Ingredient
              </button>
            </div>

            {selectedIngredients.map((ing, index) => (
              <div key={index} className="card bg-base-200 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control relative">
                    <label className="label">
                      <span className="label-text">Ingredient Name</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={ing.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      required
                    />
                    {suggestedIngredients[index]?.length > 0 && (
                      <div 
                        className="absolute z-10 w-full bg-base-200 mt-1 rounded-md shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ul className="menu p-2">
                          {suggestedIngredients[index].map((suggestion) => (
                            <li key={suggestion._id}>
                              <button
                                type="button"
                                onClick={() => handleIngredientSelect(index, suggestion)}
                                className="py-2 px-4 hover:bg-base-300 w-full text-left"
                              >
                                {suggestion.name} ({suggestion.category})
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Category</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={ing.category}
                      onChange={(e) => handleIngredientChange(index, 'category', e.target.value)}
                      required
                    >
                      <option value="other">Other</option>
                      <option value="meat">Meat</option>
                      <option value="dairy">Dairy</option>
                      <option value="produce">Produce</option>
                      <option value="pantry">Pantry</option>
                      <option value="spices">Spices</option>
                      <option value="pasta">Pasta</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Amount</span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered"
                      value={ing.amount}
                      onChange={(e) => handleIngredientChange(index, 'amount', parseFloat(e.target.value))}
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Unit</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={ing.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      required
                    >
                      <option value="">Select Unit</option>
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="l">Liters (l)</option>
                      <option value="tsp">Teaspoon (tsp)</option>
                      <option value="tbsp">Tablespoon (tbsp)</option>
                      <option value="cup">Cup</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Notes (Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={ing.notes}
                      onChange={(e) => handleIngredientChange(index, 'notes', e.target.value)}
                      placeholder="e.g., finely chopped"
                    />
                  </div>
                </div>

                {selectedIngredients.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-error mt-2"
                    onClick={() => removeIngredient(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Steps</h2>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={addStep}
              >
                Add Step
              </button>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="card bg-base-200 p-4">
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Step {index + 1}</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={step.description}
                      onChange={(e) => updateStep(index, 'description', e.target.value)}
                      placeholder="Describe this step..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Timer (minutes)</span>
                      </label>
                      <input
                        type="number"
                        className="input input-bordered"
                        value={step.timer}
                        onChange={(e) => updateStep(index, 'timer', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Notes</span>
                      </label>
                      <input
                        type="text"
                        className="input input-bordered"
                        value={step.notes}
                        onChange={(e) => updateStep(index, 'notes', e.target.value)}
                        placeholder="Optional tips or notes"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="space-x-2">
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === steps.length - 1}
                      >
                        ↓
                      </button>
                    </div>

                    {steps.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-sm btn-error"
                        onClick={() => removeStep(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Recipe'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
} 