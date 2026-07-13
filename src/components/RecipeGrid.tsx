import type { Recipe } from '../data/recipesTypes'
import { tasteScore } from '../lib/appConfig'
import { RecipeCover } from './RecipeCover'

type RecipeGridProps = {
  recipes: Recipe[]
  favoriteIds: string[]
  pantryTokens: string[]
  pantryScoreByRecipe: Map<string, number>
  onSelectRecipe: (recipeId: string) => void
  onToggleFavorite: (recipeId: string) => void
}

export function RecipeGrid({
  recipes,
  favoriteIds,
  pantryTokens,
  pantryScoreByRecipe,
  onSelectRecipe,
  onToggleFavorite,
}: RecipeGridProps) {
  if (recipes.length === 0) {
    return <p className="empty grid-empty">No recipes match your filters.</p>
  }

  return (
    <section className="recipe-grid" aria-label="Recipes">
      {recipes.map((recipe) => {
        const isFavorite = favoriteIds.includes(recipe.id)
        const pantryMatch = pantryScoreByRecipe.get(recipe.id) ?? 0

        return (
          <article
            key={recipe.id}
            className="grid-card"
            draggable
            onDragStart={(event) => {
              event.dataTransfer.setData('text/recipe-id', recipe.id)
              event.dataTransfer.effectAllowed = 'copy'
            }}
          >
            <div
              className="grid-card-inner"
              role="button"
              tabIndex={0}
              onClick={() => onSelectRecipe(recipe.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectRecipe(recipe.id)
                }
              }}
            >
              <RecipeCover recipe={recipe} className="grid-cover" />
              <div className="grid-card-body">
                <h3>{recipe.title}</h3>
                <p>{recipe.description}</p>
                <div className="grid-meta">
                  <span>{recipe.cuisine}</span>
                  <span className="grid-badge grid-time">⏱ {recipe.prepMinutes + recipe.cookMinutes} min</span>
                  <span className={`grid-badge grid-difficulty diff-${recipe.difficulty.toLowerCase()}`}>
                    {recipe.difficulty}
                  </span>
                  <span className="grid-taste">★ {tasteScore(recipe).toFixed(1)}</span>
                </div>
                {pantryTokens.length > 0 && (
                  <p className="hint">
                    You have {pantryMatch}/{recipe.ingredients.length} ingredients
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              className={`favorite-button ${isFavorite ? 'on' : ''}`}
              onClick={() => onToggleFavorite(recipe.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </article>
        )
      })}
    </section>
  )
}
