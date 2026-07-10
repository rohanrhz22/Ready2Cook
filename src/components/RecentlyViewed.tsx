import type { Recipe } from '../data/recipesTypes'
import { cuisineEmoji } from '../lib/appConfig'

type RecentlyViewedProps = {
  recipes: Recipe[]
  onSelect: (recipeId: string) => void
}

export function RecentlyViewed({ recipes, onSelect }: RecentlyViewedProps) {
  if (recipes.length === 0) return null

  return (
    <section className="recently-viewed" aria-label="Recently viewed recipes">
      <h2>Recently viewed</h2>
      <div className="recent-strip">
        {recipes.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            className="recent-chip"
            onClick={() => onSelect(recipe.id)}
          >
            <span aria-hidden="true">{cuisineEmoji(recipe.cuisine)}</span>
            {recipe.title}
          </button>
        ))}
      </div>
    </section>
  )
}
