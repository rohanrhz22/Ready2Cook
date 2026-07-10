import { useState } from 'react'
import type { Recipe } from '../data/recipesTypes'
import { cuisineEmoji } from '../lib/appConfig'
import { recipeImageUrl } from '../lib/recipeImage'

type RecipeCoverProps = {
  recipe: Recipe
  className?: string
}

export function RecipeCover({ recipe, className }: RecipeCoverProps) {
  const [failed, setFailed] = useState(false)
  const src = recipe.image ?? recipeImageUrl(recipe)

  return (
    <div
      className={`recipe-cover ${className ?? ''}`}
      data-cuisine={recipe.cuisine}
      aria-hidden="true"
    >
      {failed ? (
        <span className="recipe-cover-emoji">{cuisineEmoji(recipe.cuisine)}</span>
      ) : (
        <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} />
      )}
    </div>
  )
}
