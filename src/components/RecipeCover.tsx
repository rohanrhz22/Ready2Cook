import { useState } from 'react'
import type { Recipe } from '../data/recipesTypes'
import { cuisineEmoji } from '../lib/appConfig'

type RecipeCoverProps = {
  recipe: Recipe
  className?: string
}

export function RecipeCover({ recipe, className }: RecipeCoverProps) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(recipe.image) && !failed

  return (
    <div
      className={`recipe-cover ${className ?? ''}`}
      data-cuisine={recipe.cuisine}
      aria-hidden="true"
    >
      {showImage ? (
        <img src={recipe.image} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="recipe-cover-emoji">{cuisineEmoji(recipe.cuisine)}</span>
      )}
    </div>
  )
}
