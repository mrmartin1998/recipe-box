'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function RecipeCard({ recipe }) {
  const [isImageError, setIsImageError] = useState(false)
  
  return (
    <div className="card bg-base-200 shadow-xl h-full">
      <figure className="relative h-48">
        {!isImageError && recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.name}
            fill
            className="object-cover"
            onError={() => setIsImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-base-300 flex items-center justify-center">
            <span className="text-4xl">🍳</span>
          </div>
        )}
      </figure>
      
      <div className="card-body">
        <h2 className="card-title">
          {recipe.name}
          {recipe.favorite && <span className="text-warning">★</span>}
        </h2>
        
        <p className="text-base-content/70 line-clamp-2">{recipe.description}</p>
        
        <div className="flex gap-2 mt-2">
          <div className="badge badge-outline">{recipe.cookTime} mins</div>
          <div className="badge badge-outline">{recipe.servings} servings</div>
        </div>
        
        <div className="card-actions justify-end mt-4">
          <Link href={`/recipes/${recipe._id}`} className="btn btn-primary btn-sm">
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  )
} 